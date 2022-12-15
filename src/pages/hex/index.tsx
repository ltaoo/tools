/**
 * @file 进制转换
 */
import PageLayout from "@/components/PageLayout";
import { useValue } from "@/hooks";

const HexTransformerPage = () => {
  const [value, onChange] = useValue("");

  return (
    <PageLayout title="进制转换">
      <div>
        <input className="input" value={value} onChange={onChange} />
      </div>
    </PageLayout>
  );
};

export default HexTransformerPage;
