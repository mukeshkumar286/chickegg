import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  iconBgClass: string;
  iconClass: string;
  trend: {
    value: number;
    label: string;
  };
}

const MetricCard = ({ title, value, icon, iconBgClass, iconClass, trend }: MetricCardProps) => {
  const isPositive = trend.value >= 0;
  
  return (
    <Card className="p-6 border border-neutral-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`${iconBgClass} p-2 rounded-lg`}>
          <i className={`${icon} ${iconClass} text-xl`}></i>
        </div>
      </div>
      <div className="flex items-center mt-4">
        <span className={`${isPositive ? 'text-green-600' : 'text-red-600'} text-sm font-medium flex items-center`}>
          <i className={`${isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i> 
          {Math.abs(trend.value)}%
        </span>
        <span className="text-neutral-500 text-sm ml-2">{trend.label}</span>
      </div>
    </Card>
  );
};

export default MetricCard;
