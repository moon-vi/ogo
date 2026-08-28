# LUNAR X — GitHub Pages 发布版

这是纯静态正式发布目录。**不要把本地 admin.html / admin-local.js 上传到公开仓库**。

## 上传 GitHub

建议新建一个公开仓库，然后把本压缩包解压后的内容放到仓库根目录：

- index.html
- 404.html
- css/
- js/
- images/
- robots.txt
- .nojekyll

GitHub 仓库中进入：

`Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)`

随后等待 GitHub Pages 发布完成。

## 图片一定要补齐

历史静态包一直没有包含原网站的 `images/` 文件夹，所以本发布版只能保留图片路径。
在上传 GitHub 之前，请把你本地现有网站的全部图片复制到本发布版的 `images/` 目录。

`images/README_请复制原图片.txt` 中列出了当前 data.js 引用的文件。

## 后续更新网站

继续使用你本地的静态后台版本维护内容：

1. 本地后台修改 Banner / 案例 / 动态等；
2. 导出新的 `data.js`；
3. 用新文件替换本发布仓库的 `js/data.js`；
4. 新图片复制到 `images/`；
5. Commit / Push 到 GitHub；
6. GitHub Pages 自动更新。

## 自定义域名

域名购买后，在 GitHub Pages 的 Custom domain 中填写域名。

本目录提供：
- `CNAME.example`
- `sitemap.xml.example`

确定域名以后：

1. 把 `CNAME.example` 改名为 `CNAME`；
2. 内容改为你的真实域名，例如 `www.example.com`；
3. 把 `sitemap.xml.example` 改名为 `sitemap.xml`，替换其中域名；
4. 在 `js/data.js` 中找到 `siteInfo.seo.siteUrl`，填入完整网址，例如：
   `https://www.example.com`
5. 域名 DNS 按 GitHub Pages 页面给出的要求配置。

## 安全

公开 GitHub Pages 是纯静态网站。不要上传：
- 本地后台 admin.html
- admin-local.js
- 密码
- 私密证书原件（除非你明确希望公开展示）
- API Key / Token

本发布包已经排除了本地后台文件。
