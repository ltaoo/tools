/**
 * 
#[derive(Deserialize, Serialize, Debug)]
pub struct NpmPackageResp {
    // 包名
    name: String,
    // 描述
    description: Option<String>,
    // 版本号
    version: String,
    // 作者
    author: Option<NpmPackageAuthor>,
    // 发布者
    publisher: NpmPackagePublisher,
    maintainers: Option<Vec<NpmPackagePublisher>>,
    // 关键字
    keywords: Option<Vec<String>>,
    // 最后更新时间
    date: String,
    // 相关链接
    links: Option<NpmPackageLinks>,
}
#[derive(Deserialize, Serialize, Debug)]
struct NpmPackageLinks {
    npm: String,
    homepage: Option<String>,
    bugs: Option<String>,
}
#[derive(Deserialize, Serialize, Debug)]
struct NpmPackageAuthor {
    name: String,
}
#[derive(Deserialize, Serialize, Debug)]
struct NpmPackagePublisher {
    username: String,
    email: String,
}
 */
