package com.example.dienlanh.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import com.example.dienlanh.dto.UserResponseDTO;
import com.example.dienlanh.dto.request.UserCreateDTO;
import com.example.dienlanh.dto.request.UserUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceAlreadyExistsException;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.User;
import com.example.dienlanh.model.User.UserRole;
import com.example.dienlanh.model.User.UserStatus;
import com.example.dienlanh.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final com.example.dienlanh.repository.TechnicianRepository technicianRepository;

    // convert from user to userResponse
    public UserResponseDTO convertToDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .address(user.getAddress())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .lastLoginTime(user.getLastLoginTime())
                .lastLoginIp(user.getLastLoginIp())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // get all user
    public List<UserResponseDTO> getAllUser(Pageable pageable) {

        List<UserResponseDTO> users = this.userRepository.findAll(pageable).stream().map(user -> convertToDTO(user))
                .collect(Collectors.toList());
        if (users == null || users.isEmpty()) {
            throw new ResourceNotFoundException("Not found user ");
        }

        return users;
    }

    // create new user
    public UserResponseDTO createUser(UserCreateDTO inputUser) {
        if (this.userRepository.existsByEmail(inputUser.getEmail())) {
            throw new ResourceNotFoundException("email: " + inputUser.getEmail() + " đã tồn tại.");
        }

        User user = new User();
        user.setName(inputUser.getName());
        user.setEmail(inputUser.getEmail());
        user.setPhone(inputUser.getPhone());
        user.setPassword(passwordEncoder.encode(inputUser.getPassword()));
        user.setAddress(inputUser.getAddress());

        if (inputUser.getRole() != null && !inputUser.getRole().trim().isEmpty()) {
            user.setRole(com.example.dienlanh.model.User.UserRole.valueOf(inputUser.getRole().trim().toUpperCase()));
        } else {
            user.setRole(com.example.dienlanh.model.User.UserRole.CUSTOMER);
        }

        if (inputUser.getStatus() != null && !inputUser.getStatus().trim().isEmpty()) {
            user.setStatus(
                    com.example.dienlanh.model.User.UserStatus.valueOf(inputUser.getStatus().trim().toUpperCase()));
        } else {
            user.setStatus(com.example.dienlanh.model.User.UserStatus.ACTIVE);
        }

        this.userRepository.save(user);

        // If the created user is a technician, create a default technician profile
        if (user.getRole() == com.example.dienlanh.model.User.UserRole.TECHNICIAN) {
            if (!this.technicianRepository.findByUserId(user.getId()).isPresent()) {
                com.example.dienlanh.model.Technician tech = new com.example.dienlanh.model.Technician();
                tech.setUser(user);
                tech.setName(user.getName());
                tech.setPhone(user.getPhone());
                tech.setAddress(user.getAddress());
                tech.setSpecialty(com.example.dienlanh.model.Technician.TechnicianSpecialty.BOTH);
                tech.setStatus(com.example.dienlanh.model.Technician.TechnicianStatus.ACTIVE);
                tech.setRating(5.0);
                tech.setTotalJobs(0);
                this.technicianRepository.save(tech);
            }
        }

        return convertToDTO(user);
    }

    // sent email
    public void sentOtp(String email) {
        // Kiểm tra email
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống!");
        }

        if (this.userRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExistsException("Email đã tồn tại");
        }

        this.emailService.sendOtpEmail(email);

    }

    // verify email by otp
    public boolean verifyEmail(String email, String Otp) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống!");
        }
        if (Otp == null || Otp.isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống!");
        }

        return this.emailService.verifyOtp(email, Otp);

    }

    // register account
    public UserResponseDTO register(UserCreateDTO dto) {

        User user = userRepository.findByEmail(dto.getEmail())
                .orElse(new User());

        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setAddress(dto.getAddress());
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        user.setVerified(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        this.userRepository.save(user);
        this.emailService.sendSuccessEmail(dto.getEmail());
        return convertToDTO(user);

    }

    // get user by id
    public UserResponseDTO getUserByID(Long id) {
        User user = this.userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist with id: " + id));
        return convertToDTO(user);
    }

    // update user by id
    public UserResponseDTO updateUserById(Long id, UserUpdateDTO inputUser) {
        User userID = this.userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist with id: " + id));

        // Chỉ cập nhật field khi giá trị được truyền vào (null-safe partial update)
        if (inputUser.getName() != null && !inputUser.getName().trim().isEmpty()) {
            userID.setName(inputUser.getName());
        }
        if (inputUser.getPhone() != null) {
            userID.setPhone(inputUser.getPhone());
        }
        if (inputUser.getAddress() != null) {
            userID.setAddress(inputUser.getAddress());
        }
        if (inputUser.getEmail() != null && !inputUser.getEmail().trim().isEmpty()) {
            userID.setEmail(inputUser.getEmail());
        }

        if (inputUser.getRole() != null && !inputUser.getRole().trim().isEmpty()) {
            userID.setRole(com.example.dienlanh.model.User.UserRole.valueOf(inputUser.getRole().trim().toUpperCase()));
        }

        if (inputUser.getStatus() != null && !inputUser.getStatus().trim().isEmpty()) {
            userID.setStatus(
                    com.example.dienlanh.model.User.UserStatus.valueOf(inputUser.getStatus().trim().toUpperCase()));
        }

        this.userRepository.save(userID);

        // If updated to technician, make sure they have a profile
        if (userID.getRole() == com.example.dienlanh.model.User.UserRole.TECHNICIAN) {
            if (!this.technicianRepository.findByUserId(userID.getId()).isPresent()) {
                com.example.dienlanh.model.Technician tech = new com.example.dienlanh.model.Technician();
                tech.setUser(userID);
                tech.setName(userID.getName());
                tech.setPhone(userID.getPhone());
                tech.setAddress(userID.getAddress());
                tech.setSpecialty(com.example.dienlanh.model.Technician.TechnicianSpecialty.BOTH);
                tech.setStatus(com.example.dienlanh.model.Technician.TechnicianStatus.ACTIVE);
                tech.setRating(5.0);
                tech.setTotalJobs(0);
                this.technicianRepository.save(tech);
            }
        }

        return convertToDTO(userID);
    }

    // delete User by id
    public void deleteUser(Long id) {
        this.userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User does not exist with id: " + id));
        this.userRepository.deleteById(id);
    }

}
