/**
 * @file 页面布局
 * 每个页面都使用该组件包裹
 */
interface IPageProps {
  title: string;
}
const PageLayout: React.FC<IPageProps> = (props) => {
  const { title, children } = props;
  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div>{children}</div>
    </div>
  );
};

export default PageLayout;
