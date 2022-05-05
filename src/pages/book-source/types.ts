export interface IBookRes {
  title: string;
  author: string;
  intro?: string;
  cover?: string;
  sources: ({
    /**
     * 书籍在该书源的 url
     */
    url: string;
  } & IBookSourceRules)[];
}

/**
 * 替换器
 */
export type IReplaceRules = [string, string][];
/**
 * 提取器
 */
export interface IContentExtract {
  s?: string;
  b?: IReplaceRules;
  r: string;
  a?: IReplaceRules;
}

/**
 * 搜索结果
 */
export type ISearchResult = {
  /**
   * 书籍名称
   */
  title: string;
  /**
   * 书籍作者
   */
  author: string;
  /**
   * 书籍封面
   */
  cover?: string;
  /**
   * 书籍介绍
   */
  intro?: string;
  /**
   * 所有章节
   */
  chapters: {
    /**
     * 章节名称
     */
    title: string;
    /**
     * 章节书源
     */
    sources: {
      /**
       * 该章节在该书源的地址
       */
      url: string;
    }[];
  }[];
  sources: {
    /**
     * 书源名称
     */
    name?: string;
    /**
     * 书源网站
     */
    host: string;
    /**
     * 书籍在该书源的地址
     */
    url: string;
    /**
     * 书源实例
     */
    // $instance: BookSource;
  }[];
};

/**
 * 书籍信息提取规则
 */
export interface IBookSourceRules {
  disabled?: boolean;
  name?: string;
  host: string;
  search: string;
  /**
   * 提取规则
   */
  extract: {
    /**
     * 是否需要模拟为手机进行访问
     */
    mobile?: boolean;
    /**
     * 书籍详情
     */
    profile: {
      title: IContentExtract;
      author: IContentExtract;
      intro: IContentExtract;
      cover: IContentExtract;
    };
    /**
     * 最近更新时间
     */
    latest_updated: IContentExtract;
    /**
     * 章列表
     */
    chapters: {
      /**
       * 该页面的交互
       * 第一个字符串是行为，第二个是选择器
       * ['click', '.btn']
       * ['type', '.input', 'test']
       */
      i?: [string, string, string?][];
      data_source: IContentExtract;
      title: IContentExtract;
      url: IContentExtract;
    };
    /**
     * 章及正文
     */
    chapter: {
      title?: IContentExtract;
      content: IContentExtract;
    };
    /**
     * 最新章节
     */
    latest_chapters: {
      data_source: IContentExtract;
      title: IContentExtract;
      url: IContentExtract;
      updated: IContentExtract;
    };
    /**
     * 搜索
     */
    search: {
      i?: [string, string, string?][];
      data_source: IContentExtract;
      title: IContentExtract;
      author: IContentExtract;
      url: IContentExtract;
      cover?: IContentExtract;
      intro?: IContentExtract;
    };
  };
}

export interface IPageRequestParams {
  url: string;
  mobile?: boolean;
  cache_key?: string;
  host?: string;
  i?: [string, string, string?][];
  kw?: string;
}

export interface ICache {
  get: (key: string) => Promise<string>;
  set: (key: string, content: string) => Promise<void>;
}

export interface Result<T> {
  Ok(): null | T;
  Err(): null | string;
}
