export const questions = [
  {
    intro: "字符 a 后面跟着至少一个任意字符，再跟着一个字符 a",
    input: "a1aabaa+a",
    expect: ["a1a", "aba", "a+a"],
  },
  {
    intro: "字符串 <tr> 后面跟着任意数量的任意字符，再跟着字符串 </tr>",
    input: "<tr>hello</tr>\n\n<tr>something</tr>",
    expect: ["<tr>hello</tr>", "<tr>something</tr>"],
  },
  {
    intro: "字符 a 后面跟着至少一个任意字符，且不能为字符 b，再跟着一个字符 a",
    input: "ab1c+aa1c+aa1bc+aa1cb+aa1c+ba",
    expect: ["a1c+a"],
    reference: "(?<=a)a[^b]{1,}?a",
  },
  {
    intro:
      "字符 a 后面跟着至少一个任意字符，且不能包含字符串 be，再跟着一个字符 a",
    input: "abe1c+aab1c+aa1bec+aa1cbe+aa1c+bea",
    expect: ["ab1c+a"],
    reference: "(?![\\s\\S]{1,}be)a[^a]{1,}a",
    // (?!a[^a]{0,}be)a[^a]{1,}a
  },
  {
    intro: "字符 a 跟着至少一个任意字符，且必须包含字符 b，再跟着字符 a",
    input: "ab1c+aa1c+a",
    expect: ["ab1c+a"],
  },
  {
    intro: "字符 a 跟着至少一个任意字符，且必须包含字符串 bb，再跟着字符 a",
    input: "abb1c+aab1c+aa1bbc+aa1cbb+aa1c+bba",
    expect: ["abb1c+a", "a1bbc+a", "a1cbb+a", "a1c+bba"],
    reference: "a[^a]{0,}?bb[^a]{0,}?a",
    // reference: "(?=a[^a]{0,}bb)a[^a]{1,}a",
  },
  {
    intro:
      "字符串 <div> 后面跟着至少一个任意字符，且必须包含字符串 man，再跟着字符串 </div>",
    input:
      "<div>helloworldwo</div><div>hellomanwo</div><div>hellosomethingwo</div>",
    expect: ["<div>hellomanwo</div>"],
    reference: "(?=<div>[^<div>]{0,}man)<div>[^<]{1,}</div>",
  },
  {
    intro:
      "字符串 <div> 后面跟着至少一个任意字符，且必须包含字符串 man，再跟着字符串 </p>",
    input: "<div>helloworldwo</p><div>hellomanwo</p><div>hellosomethingwo</p>",
    expect: ["<div>hellomanwo</p>"],
    reference: "(?=<div>[^<div>]{0,}man)<div>[^<]{1,}</p>",
  },
  {
    intro:
      "字符串 <h2> 后面跟着至少一个任意字符，且必须包含字符串 mark，再跟着字符串 </h2>",
    input:
      "<h2>hello</h2><h2>prefix<mark>inner</mark>suffix</h2></h2><h2>world</h2>",
    expect: ["<h2>prefix<mark>inner</mark>suffix</h2>"],
    references: [
      "<h2>[^<h2>]{0,}?<mark>[\\s\\S]{0,}?</h2>",
      "(?=<h2>[^<h2>]{0,}<mark>)<h2>[\\s\\S]{1,}</h2>",
    ],
  },
  {
    intro:
      "字符串 <div> 后面跟着至少一个任意字符，且不能包含字符串 man，再跟着字符串 </div>",
    input:
      "<div>helloworldwo</div><div>hellomanwo</div><div>hellosomethingwo</div>",
    expect: ["<div>helloworldwo</div>", "<div>hellosomethingwo</div>"],
    reference: "(?!<div>[^<div>]{0,}man)<div>[^<]{1,}</div>",
  },
  {
    intro:
      "字符串 <div> 后面跟着至少一个任意字符，且不能包含字符串 <mark>，再跟着字符串 </div>",
    input: "<h2>hello</h2><h2><mark>hello</h2></h2><h2>world</h2>",
    expect: ["<h2>hello</h2>", "<h2>world</h2>"],
    reference: "(?!<h2>[^<h2>]{0,}mark)<h2>[^<]{1,}</h2>",
  },
  {
    intro: "至少一个任意字符，且前面不为字符 a",
    input: "ab1b+b",
    expect: ["1b", "+b"],
  },
  {
    intro:
      "字符串 <p> 跟着至少一个任意字符，再跟着字符串 </p>，且前面不能包含 <p>",
    input: "<div><p>a1+</p><span>h</span><p>a1+2</p></div>",
    expect: ["<p>a1+2</p>"],
    reference: "(?<=<p>[\\s\\S]{1,})<p>[^<]{1,}</p>",
  },
  // 前面必须有，其实就是指定模式后面的位置+想匹配的模式
  // 如前面必须有 abc，正则就是 (?<=abc[\s\S]{0,}?)content
  // 但是也可以直接 abc[\s\S]{0,}content
  // 重点就是判断还是提取
  {
    intro:
      "字符串 <p> 跟着至少一个任意字符，再跟着字符串 </p>，且后面必须包含 <p>",
    input: "<div><p>a1+</p><span>h</span><p>a1+2</p></div>",
    expect: ["<p>a1+</p>"],
  },
  {
    input: "<div>he</div>a1+</div></div>",
    expect: ["<div></div>a1+</div>"],
  },
];
