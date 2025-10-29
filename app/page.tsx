import SummaryCards from '@/components/SummaryCards'

type CategoryCardProps = {
  name: string
  spent: number
  limit: number
}

function CategoryCard({ name, spent, limit }: CategoryCardProps) {
  const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0

  return (
    <div className="category-card" aria-label={`Category ${name}`}>
      <h3>{name}</h3>
      <p>Spent: ¥{spent}</p>
      <p>Limit: ¥{limit}</p>
      <div className="progress" style={{ background: '#e6e6e6', borderRadius: 4, height: 8, overflow: 'hidden', width: '100%' }}>
        <div style={{ width: `${percent}%`, background: '#4f46e5', height: '100%' }} />
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div>
      <SummaryCards />
      <h2>Categories</h2>
      <div className="category-grid">
        <CategoryCard name="Food" spent={1500} limit={2000} />
        <CategoryCard name="Rent" spent={25000} limit={30000} />
        <CategoryCard name="Transport" spent={5000} limit={8000} />
      </div>
    </div>
  )
}
