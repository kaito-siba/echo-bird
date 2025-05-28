// MongoDB初期化スクリプト
db = db.getSiblingDB("echo_bird");

// コレクションの作成（必要に応じて）
db.createCollection("users");
db.createCollection("posts");

print("Echo Bird database initialized successfully!");
