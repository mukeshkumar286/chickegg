import { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  change?: number;
  prefix?: string;
};

const StatCard = ({
  title,
  value,
  icon,
  iconBgColor,
  change,
  prefix = "",
}: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;
  const changeText = change !== undefined ? `${Math.abs(change).toFixed(1)}%` : null;

  return (
    <Card className="overflow-hidden bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-3 rounded-md", iconBgColor)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {prefix}{value}
                </div>
                {changeText && (
                  <div
                    className={cn(
                      "ml-2 flex items-baseline text-sm font-semibold",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    <span className="sr-only">
                      {isPositive ? "Increased" : "Decreased"} by
                    </span>
                    {changeText}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
