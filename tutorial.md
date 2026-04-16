# 如何在 NextChat 中接入 Google Cloud Platform (GCP) Vertex AI

通过本教程，你将学习如何配置并使用 GCP Vertex AI 提供的强大模型（如 `gemini-3.1-pro-preview`、`gemini-1.5-pro` 等）与 NextChat 进行对话。

与 Google AI Studio (Gemini API) 简单的 API Key 不同，**GCP Vertex AI 面向企业级服务，对数据隐私有更严格的保护，因此要求使用 Google Cloud 身份验证（Service Account/OAuth 2.0 令牌），不支持简单的 API Key 调用。** 

不用担心，NextChat 已经在服务端完美集成了自动鉴权功能。只需按照以下步骤获取并配置你的“服务账号 JSON 密钥”即可开箱即用。

---

## 步骤 1：准备 Google Cloud 项目
1. 访问并登录 [Google Cloud Console](https://console.cloud.google.com/)。
2. 在控制台左上角，点击项目下拉菜单，选择一个现有项目，或点击 **“新建项目” (New Project)**。
3. 记下你的 **项目 ID (Project ID)**。注意：它是全局唯一的标识符，通常包含字母和数字，不同于项目名称。

## 步骤 2：启用 Vertex AI API
1. 确保你的项目已经绑定了有效的结算账号（Billing Account）。
2. 在顶部搜索栏中输入 `Vertex AI API`，然后按回车。
3. 点击搜索结果中的 **Vertex AI API**，然后点击 **“启用” (Enable)** 按钮。

## 步骤 3：创建服务账号 (Service Account)
Vertex AI 必须通过授权的服务账号进行 API 调用。
1. 在 Google Cloud 控制台的左侧导航栏中，找到并前往 **“IAM 和管理” (IAM & Admin)** > **“服务账号” (Service Accounts)**。
2. 点击页面顶部的 **“创建服务账号” (Create Service Account)**。
3. 填写服务账号名称（例如 `nextchat-vertex`），然后点击 **“创建并继续” (Create and Continue)**。
4. 在“选择角色”下拉菜单中，搜索并选择 **Vertex AI User** 角色。
5. 点击 **“完成” (Done)** 保存该服务账号。

## 步骤 4：生成并下载 JSON 密钥
1. 在服务账号列表中，点击你刚刚创建的服务账号名称。
2. 切换到 **“密钥” (Keys)** 选项卡。
3. 点击 **“添加密钥” (Add Key)** > **“创建新密钥” (Create new key)**。
4. 选择 **JSON** 格式，然后点击 **“创建” (Create)**。
5. 此时会自动下载一个包含私钥的 JSON 文件。**妥善保管该文件，切勿将其泄露到公开代码库中。**

---

## 步骤 5：在 NextChat 中配置 Vertex AI

你可以通过 **环境变量配置**（推荐，适合部署）或 **网页端设置页配置**（适合个人本地测试）来接入模型。

### 选项 A：使用环境变量配置（推荐 Vercel 或 Docker 部署）
打开你项目根目录的 `.env` 文件（如果是 Docker 请修改环境变量配置），添加以下内容：

```env
# 你的 Google Cloud 项目 ID
GOOGLE_VERTEX_PROJECT_ID=your-project-id-12345

# 你的模型部署区域，例如 us-central1、asia-northeast1 等
GOOGLE_VERTEX_REGION=us-central1

# 复制刚才下载的 JSON 文件中的完整内容，并粘贴到此处，合并为一行（或保持合法 JSON 格式）
# NextChat 服务端会自动将其解析，并实时生成 OAuth 令牌访问 Vertex AI
GOOGLE_VERTEX_API_KEY={ "type": "service_account", "project_id": "...", "private_key": "...", ... }
```
或者，如果你在服务器环境中已经设置了 `GOOGLE_APPLICATION_CREDENTIALS` 指向该 JSON 文件的绝对路径，NextChat 也可以直接读取系统的默认凭证。

### 选项 B：在 NextChat 网页端设置页面直接配置
1. 打开 NextChat 页面，点击左下角的 **设置 (Settings)** 齿轮图标。
2. 找到 **模型服务商 (Model Provider)**，在下拉菜单中选择 `GoogleVertex`。
3. 依次填入：
   - **项目 ID (Project ID)**：你的 GCP Project ID。
   - **区域 (Region)**：例如 `us-central1`。
   - **API 密钥或凭证 (API Key or Token)**：用记事本打开你下载的 JSON 密钥文件，复制所有文本，直接粘贴到密码框中。*(你也可以使用 `gcloud auth print-access-token` 生成的临时 Token 粘贴于此，但 Token 有效期通常只有 1 小时)*。

---

## 步骤 6：开始聊天

配置完成后，关闭设置面板并返回聊天界面：
1. 在聊天界面的模型选择器中，选择 `gemini-3.1-pro-preview` 或其它你想使用的 Vertex 系列模型。
2. 发送你的第一条消息！

🎉 恭喜！你已成功在 NextChat 中接入了企业级的高性能 Vertex AI 模型，现在可以享受极致的 AI 交互体验了。