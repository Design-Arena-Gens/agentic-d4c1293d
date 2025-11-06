"use client";

import MonkeyGardenCanvas from "./components/MonkeyGardenCanvas";

export default function Page() {
  return (
    <main className="page">
      <section className="card">
        <header className="header">
          <h1>Video chú khỉ trong vườn chuối</h1>
          <p>
            Tận hưởng hoạt họa chú khỉ vui nhộn trong khu vườn tràn ngập chuối,
            đồng thời quay lại màn trình diễn để chia sẻ cùng bạn bè.
          </p>
        </header>
        <MonkeyGardenCanvas />
        <footer className="footer">
          <h2>Mẹo tăng độ sống động</h2>
          <ul>
            <li>Ghi ít nhất 10 giây để bắt trọn cú đu dây đẹp nhất của chú khỉ.</li>
            <li>Chờ đến khi ánh nắng chuyển màu để có khung cảnh vàng ươm.</li>
            <li>
              Đảm bảo trình duyệt hỗ trợ WebM (Chrome, Edge, Firefox, Opera) để tải
              video.
            </li>
          </ul>
        </footer>
      </section>
    </main>
  );
}
