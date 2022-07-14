
# Hướng dẫn chạy demo

Đảm bảo đã có database mongoDB, Rabitmq

## Demo mã nguồn cũ
#### ECONRESET và ECONRESET 
- Bật service config :
    - cd ConfigService
    - npm i
    - npm start
- Bật Worker :
    - cd CrawlWorker_noQueue
    - npm i
    - npm start
- Sau khi bật worker sẽ chạy và log được ghi trong các file /log/history… /fail.json chứa thông tin cơ bản các bài báo bị lỗi  ECONRESET và ECONRESET 

#### ETIMEOUT, ECOBORATED
- Tăng giá trị biến TIMEOUT ở  CrawlWorker_noQueue/service/crawler/article.js dòng 58
- cd CrawlWorker_noQueue
- npm i
- npm start

## Demo mã nguồn mới mới

- Để chạy được mã nguồn mới cần cài đặt và chạy Rabitmq
- Sau khi đã cài đặt thực hiện các bước sau để chạy
    - Khởi chạy ConfigService
        - cd ConfigService
        - npm i
        - npm start
    - Khởi chạy QueueLinkCrawlWorker
        - cd QueueLinkCrawlWorker
        - npm i
        - npm start
    - Khởi chạy QueueArticleCrawlWorker
        - cd QueueArticleCrawlWorker
        - npm i
        - npm start

- Sau khi chạy thành công thì log được ghi vào thư mục QueueArticleCrawlWorker/log/demo
- Khởi chạy thêm các worker QueueArticleCrawlWorker thực hiện mở terminal mới và nhập npm start