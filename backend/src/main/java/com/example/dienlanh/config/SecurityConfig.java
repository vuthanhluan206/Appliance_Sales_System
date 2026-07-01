package com.example.dienlanh.config;

import com.example.dienlanh.repository.UserRepository;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Lấy danh sách URL cho phép truy cập công khai từ application.properties
    @Value("${security.permit-all-urls}")
    private String[] permitAllUrls;

    // Khóa bí mật dùng để mã hóa và giải mã JWT
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Bộ mã hóa mật khẩu, sử dụng BCrypt để mã hóa một chiều an toàn
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Cấu hình CORS dùng chung cho phép mọi nguồn (origins) truy cập với
    // credentials
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private final UserRepository userRepository;

    // Cấu hình chuỗi lọc bảo mật chính của Spring Security
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Cấu hình CORS sử dụng nguồn cấu hình trên
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Tắt CSRF vì REST API dùng Token (Stateless) không lo bị tấn công CSRF
                .csrf(csrf -> csrf.disable())

                // Cấu hình phiên làm việc là Stateless (Không lưu trữ session trên server)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Cấu hình phân quyền cho các request
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập công khai vào các URL lấy từ properties (login, register,
                        // refresh-token...)
                        .requestMatchers(permitAllUrls).permitAll()

                        // Bảo vệ các API quản trị viên
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // Các request còn lại đều bắt buộc phải đăng nhập (có token hợp lệ)
                        // Quyền hạn chi tiết đối với từng API sẽ được khai báo bằng @PreAuthorize ở
                        // Controller
                        .anyRequest().authenticated())

                // Cấu hình ứng dụng là Resource Server, nhận xác thực bằng JWT
                // Sử dụng Converter tùy chỉnh để map quyền cho đúng chuẩn Spring (bỏ tiền tố
                // SCOPE_)
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))

                // Lọc đăng nhập 1 phiên duy nhất (Single Session)
                .addFilterAfter(new SingleSessionFilter(userRepository),
                        org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter.class);

        return http.build();
    }

    // Bean này giúp cấu hình cách Spring Security đọc "quyền" (Role) từ trong Token
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

        // Loại bỏ tiền tố "SCOPE_" mặc định của OAuth2 để có thể dùng .hasRole() thay
        // vì .hasAuthority()
        grantedAuthoritiesConverter.setAuthorityPrefix("");

        // Đọc danh sách quyền từ claim "scope" trong payload của JWT (tuỳ thuộc cấu
        // hình lúc tạo token)
        grantedAuthoritiesConverter.setAuthoritiesClaimName("scope");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    // Bộ giải mã JWT (Dùng để kiểm tra token do client gửi lên xem có hợp lệ và
    // đúng chữ ký không)
    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(secretKeySpec).build();
    }

    // Bộ mã hóa JWT (Dùng để tạo mới token khi đăng nhập thành công để trả về cho
    // client)
    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecret.getBytes()));
    }
}
