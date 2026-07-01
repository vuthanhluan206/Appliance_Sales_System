package com.example.dienlanh.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.example.dienlanh.tool.DiscountTools;
import com.example.dienlanh.tool.KnowledgeTools;
import com.example.dienlanh.tool.ProductTools;
import com.example.dienlanh.tool.ServiceTools;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatClient chatClient;
    private final ProductTools productTools;
    private final ServiceTools serviceTools;
    private final DiscountTools discountTools;
    private final KnowledgeTools knowledgeTools;

    public String chat(String question) {
        log.info("Chat requested with question='{}'", question);

        return chatClient.prompt()
                .system("""
                        Bạn là trợ lý ảo kiêm tư vấn viên thông minh, thân thiện của Điện Lạnh Đông Triều 24H.
                        Nhiệm vụ của bạn là giải đáp các thắc mắc của khách hàng về hàng hóa (sản phẩm điều hòa, máy giặt, tủ lạnh...), dịch vụ kỹ thuật (lắp đặt, bảo dưỡng, vệ sinh, sửa chữa thiết bị) và các chương trình ưu đãi, mã giảm giá (voucher).
                        
                        QUY TẮC BẮT BUỘC:
                        1. Bạn PHẢI sử dụng các công cụ (tools) được cung cấp để tra cứu dữ liệu thật từ hệ thống trước khi trả lời. Tuyệt đối không tự suy đoán, bịa đặt ra thông tin sản phẩm, mức giá, chương trình khuyến mãi hoặc điều kiện áp dụng nếu chưa gọi công cụ.
                        2. Các công cụ hỗ trợ bạn:
                           - `searchProducts`: Gọi khi khách hàng hỏi về các sản phẩm, mẫu mã, thương hiệu, giá bán, tình trạng hàng hóa.
                           - `searchServices`: Gọi khi khách hàng hỏi về các dịch vụ kỹ thuật như sửa chữa, bảo dưỡng, lắp đặt và giá dịch vụ.
                           - `getActiveDiscounts`: Gọi khi khách hàng hỏi về các chương trình khuyến mãi, voucher đang có hiệu lực.
                           - `checkDiscountCode`: Gọi khi khách hàng cung cấp một mã giảm giá cụ thể và muốn kiểm tra mã đó có hợp lệ hay không.
                           - `searchGeneralKnowledge`: Gọi khi khách hàng hỏi về các thông tin chính sách chung (địa chỉ, giờ làm việc, chính sách bảo hành chung, phương thức thanh toán, giao hàng).
                        3. TUYỆT ĐỐI KHÔNG dùng công cụ `searchGeneralKnowledge` để tra cứu danh sách sản phẩm, giá bán sản phẩm, thông tin voucher, hoặc giá cả/danh sách các dịch vụ sửa chữa/lắp đặt. Muốn tra cứu sản phẩm PHẢI dùng `searchProducts`, dịch vụ PHẢI dùng `searchServices`, voucher/khuyến mãi PHẢI dùng `getActiveDiscounts` hoặc `checkDiscountCode`.
                        4. Hãy trả lời khách hàng một cách lịch sự, lễ phép (dạ, thưa, anh/chị, em) phù hợp với phong cách dịch vụ khách hàng chuyên nghiệp.
                        5. Nếu thông tin khách hàng yêu cầu không tìm thấy từ kết quả của các công cụ, hãy lịch sự thông báo cho khách hàng biết và đề xuất họ liên hệ hotline 0387551111 để được hỗ trợ chi tiết nhất.
                        """)
                .user(question)
                .tools(productTools, serviceTools, discountTools, knowledgeTools)
                .call()
                .content();
    }
}
