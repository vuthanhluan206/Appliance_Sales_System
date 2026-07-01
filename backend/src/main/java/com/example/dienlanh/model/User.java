package com.example.dienlanh.model;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    private String OptCode;

    private boolean isVerified = false;

    @Column(name = "last_login_token")
    private String lastLoginToken;

    @Column(nullable = false)
    @Pattern(regexp = "^0[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không hợp lệ (Phải là 10 số và đúng đầu số Việt Nam)")
    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role; // CUSTOMER, TECHNICIAN, ADMIN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status; // ACTIVE, INACTIVE, BANNED

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Technician technician;

    // cascade = CascadeType.ALL, orphanRemoval = true thêm cái này vào sẽ có tác
    // dụng xóa tất cả những thí liên quan đến User
    // @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval =true)
    // private List<Review> reviews;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        CUSTOMER, TECHNICIAN, ADMIN
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, BANNED
    }
}
