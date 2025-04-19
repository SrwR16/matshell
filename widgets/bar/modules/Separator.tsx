export default function Separator({ visible = true }) {
  return (
    <label visible={visible} cssClasses={["separator", "module"]} label="" />
  );
}
