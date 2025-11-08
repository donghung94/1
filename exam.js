/* --- CSS THÊM VÀO ĐỂ TÔ MÀU ĐÁP ÁN VÀ ĐIỀU CHỈNH NÚT --- */

/* 1. Đảm bảo lớp cơ bản cho các lựa chọn (Nếu chưa có) */
.opt {
    display: flex;
    align-items: center;
    padding: 14px;
    margin-bottom: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    /* Giữ nguyên font và bố cục khác của bạn */
}

/* 2. Thiết lập màu nền cho đáp án Đúng */
.opt.correct-answer {
    background-color: #d4edda; /* Nền xanh nhạt */
    border-color: #155724; /* Viền xanh đậm */
    font-weight: 500;
}

/* 3. Thiết lập màu nền cho đáp án Sai do người dùng chọn */
.opt.incorrect-picked {
    background-color: #f8d7da; /* Nền đỏ nhạt */
    border-color: #721c24; /* Viền đỏ đậm */
    font-weight: 500;
    opacity: 1; 
}

/* 4. Định vị và căn chỉnh các nút điều hướng */
.nav {
    display: flex;
    justify-content: space-between; /* Đẩy 3 nút ra 2 bên và giữa */
    align-items: center;
    margin-top: 20px;
    gap: 10px; /* Khoảng cách giữa các nút */
    width: 100%;
}

/* 5. Đảm bảo nút Giải thích (ở giữa) có màu và kích thước phù hợp */
#explainBtn {
    background-color: #007bff; /* Màu xanh dương (tương đương khoanh đen) */
    color: white;
    flex-grow: 1; /* Cho phép nút này giãn ra lấp đầy khoảng trống */
}

/* 6. Định vị Nút Làm Lại Câu Sai (fixed) */
#floatingRedo {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #dc3545; /* Màu đỏ nổi bật */
    color: #fff;
    border: none;
    padding: 12px 24px;
    border-radius: 9999px; /* Hình tròn */
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    font-weight: bold;
    transition: all 0.2s ease;
}

#floatingRedo:hover {
    background-color: #c82333;
    transform: scale(1.05);
}

/* --- HẾT PHẦN CSS THÊM VÀO --- */
