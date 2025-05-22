# Enterprise Node.js Service

一个企业级的Node.js服务，具有中间件、鉴权、OAuth登录功能、环境配置、Docker部署和GitHub Actions CI/CD集成，以及SQLite数据库支持。

## 功能特点

- 完整的身份验证系统（本地用户名/密码和GitHub OAuth）
- JWT和会话认证
- 基于角色的授权
- 环境配置（开发和生产环境）
- SQLite数据库集成
- Docker容器化
- GitHub Actions CI/CD流水线
- 请求验证
- 错误处理
- 日志记录

## 技术栈

- Node.js
- Express.js
- Passport.js（认证）
- Sequelize（ORM）
- SQLite（数据库）
- Docker（容器化）
- GitHub Actions（CI/CD）

## 开始使用

### 前提条件

- Node.js 14+
- npm 或 yarn
- Docker（可选，用于容器化部署）

### 安装

1. 克隆仓库

```bash
git clone <repository-url>
cd enterprise-nodejs-service
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

```bash
cp .env.example .env
# 编辑.env文件，填入必要的配置信息
```

4. 启动开发服务器

```bash
npm run dev
```

### Docker部署

1. 构建Docker镜像

```bash
docker build -t enterprise-nodejs-service .
```

2. 运行Docker容器

```bash
docker run -p 3000:3000 -d enterprise-nodejs-service
```

或者使用Docker Compose:

```bash
docker-compose up -d
```

## API文档

### 认证API

- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/github` - GitHub OAuth登录
- `GET /api/auth/profile` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 用户API

- `GET /api/users` - 获取所有用户（仅管理员）
- `GET /api/users/:id` - 获取指定用户
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

## 项目结构

```
enterprise-nodejs-service/
├── .github/            # GitHub Actions工作流配置
├── config/             # 配置文件
├── logs/               # 日志文件
├── src/                # 源代码
│   ├── config/         # 配置管理
│   ├── controllers/    # 控制器
│   ├── middlewares/    # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── services/       # 服务
│   ├── utils/          # 工具函数
│   └── app.js          # 应用入口
├── tests/              # 测试文件
├── .env                # 环境变量
├── .env.example        # 环境变量示例
├── Dockerfile          # Docker配置
├── docker-compose.yml  # Docker Compose配置
└── package.json        # 项目依赖
```

## 测试

```bash
npm test
```

## 生产部署

1. 设置生产环境变量
2. 构建并推送Docker镜像
3. 在服务器上部署Docker容器

## CI/CD流水线

GitHub Actions用于自动化测试、构建和部署流程：

1. 代码提交到main分支时触发流水线
2. 运行测试和代码检查
3. 构建Docker镜像
4. 推送镜像到Docker仓库
5. 部署到生产环境

## 许可证

ISC
