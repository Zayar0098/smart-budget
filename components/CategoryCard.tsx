type Props = { title: string; amount: number };

export default function CategoryCard({ title, amount }: Props) {
  return (
    <div className="cat-card">
      <div className="cat-title">{title}</div>
      <div className="cat-amount">{amount.toLocaleString()}</div>
    </div>
  );
}
