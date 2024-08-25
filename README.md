Mô tả DeviveHive:
  - DeviceHive là một Opensource Platform cho phép xây dựng hệ thống để quản lí các thiết bị IoT, cung cấp các API cho phép người sử dụng để xây dựng các thành phần tương tác với hệ thống.
  - CustomDeviceHive là sản phẩm xây dựng dựa trên DeviceHive tích hợp thêm khả năng lưu trữ dữ liệu và hiển thị thông số "Temperature" và "Humidity" được thu thập từ mạch ESP8266 và sensor DHT11.


Mô tả hoạt động:
1. Xây dựng hệ thống
  - Để xây dựng hệ thống CustomDeviceHive, sử dụng câu lệnh:
  -       docker-compose -f docker-compose.yml --profile all up -d
  - Sau khi pull image và build thành công các containers, cần kiểm tra xem các containers đã hoạt động được chưa bằng cách vào xem logs của các containers như dh_frontend, dh_backend, dh_auth,...:
  -     2024-08-25 12:11:30 2024-08-25 05:11:30.532 [main] INFO   c.d.a.DeviceHiveAuthApplication - Started DeviceHiveAuthApplication in 52.875 seconds (JVM running for 56.107)
  -     2024-08-25 12:12:16 2024-08-25 05:12:16.594 [main] INFO   c.d.a.DeviceHiveFrontendApplication - Started DeviceHiveFrontendApplication in 20.922 seconds (JVM running for 22.219)
  -     2024-08-25 12:10:39 2024-08-25 05:10:39.438 [main] INFO   c.d.a.DeviceHiveBackendApplication - Started DeviceHiveBackendApplication in 35.264 seconds (JVM running for 40.329)

 - Nếu không có được kết quả Started thành công như trên thì cần Restart lại các containers hoạt động chưa đúng đó.


2. Admin Console CustomDeviceHive:
  - Truy cập URL: http://localhost/admin và tiến hành đăng nhập với name **dhadmin** và password **dhadmin_#911**
  - Sau khi login thành công sẽ vào được trang quản lí của Admin.
  - Vì CustomDeviceHive là 1 sản phẩm con nên cần tạo 1 User Backend để hệ thống có thể hoạt động tốt:
    + Sang tab Users và chọn Add new user với các thông tin:
    + name: **backend**
    + password: **backend**
    + role: **ADMIN**

  3. DeviceHive cung cấp các API swagger để có thể tương tác với hệ thống:
     -  Frontend Swagger:	http://hostname/api/swagger
     -  Auth Swagger:	http://hostname/auth/swagger
     -  Plugin Swagger:	http://hostname/plugin/swagger
    
  4. Nhúng Code ESP8266-FIRMWARE và thiết lập các cấu hình cần thiết. Sau đó kết nối Sensor DHT11 và gửi dữ liệu lên CustomDeviceHive.
  5. Sử dụng http://localhost/grafana để truy cập Dashboard và sử dụng các câu lệnh truy vấn để xem dữ liệu:
```sql
SELECT s.timestamp AS "time", 
       CONCAT(d.name, ' - ', 'temperature') AS metric, 
       s.temperature AS value
FROM sensor_data AS s
INNER JOIN device AS d ON s.device_name = d.name  -- Join on the correct foreign key relationship

UNION ALL

SELECT s.timestamp AS "time", 
       CONCAT(d.name, ' - ', 'humidity') AS metric, 
       s.humidity AS value
FROM sensor_data AS s
INNER JOIN device AS d ON s.device_name = d.name;  -- Join on the correct foreign key relationship
```


Đây là sản phẩm được xây dựng dựa trên DeviceHive, vì vậy không thể tránh khỏi một số lỗi phát sinh trong quá trình sử dụng.

Nếu bạn gặp bất kỳ vấn đề nào hoặc có thắc mắc, hãy liên hệ với tôi qua email: [nhnt205@gmail.com](mailto:nhnt205@gmail.com).

Chúc bạn sử dụng vui vẻ!
