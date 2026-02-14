"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AreaSelector } from "@/components/features/AreaSelector";
import { ShoppingBasket, TrendingDown } from "lucide-react";
import type { BasketTemplate } from "@/types";

const BASKET_TEMPLATES: BasketTemplate[] = [
  {
    id: "student",
    name: "Student Survival Kit",
    description: "Basic essentials for a week",
    items: [
      { canonical_name: "Beras Super Tempatan 5kg", qty: 1 },
      { canonical_name: "Telur Ayam Gred A (10 biji)", qty: 1 },
      { canonical_name: "Maggi Kari (5 pek)", qty: 1 },
      { canonical_name: "Roti Gardenia Original", qty: 1 },
      { canonical_name: "Milo Activ-Go 500g", qty: 1 },
    ],
  },
  {
    id: "family",
    name: "Family Weekly Staples",
    description: "Feed a family of 4 for a week",
    items: [
      { canonical_name: "Beras Super Tempatan 5kg", qty: 1 },
      { canonical_name: "Ayam Standard (1kg)", qty: 2 },
      { canonical_name: "Telur Ayam Gred A (10 biji)", qty: 2 },
      { canonical_name: "Minyak Masak RBD 1kg", qty: 1 },
      { canonical_name: "Susu Dutch Lady Full Cream 1L", qty: 2 },
      { canonical_name: "Kangkung (250g)", qty: 3 },
      { canonical_name: "Gula Putih 1kg", qty: 1 },
      { canonical_name: "Roti Gardenia Original", qty: 2 },
    ],
  },
  {
    id: "mamak",
    name: "Mamak Survival Kit",
    description: "Cook like your favourite mamak",
    items: [
      { canonical_name: "Telur Ayam Gred A (10 biji)", qty: 2 },
      { canonical_name: "Maggi Kari (5 pek)", qty: 2 },
      { canonical_name: "Minyak Masak RBD 1kg", qty: 1 },
      { canonical_name: "Bawang Merah (500g)", qty: 1 },
      { canonical_name: "Bawang Putih (250g)", qty: 1 },
      { canonical_name: "Teh Boh (100 beg)", qty: 1 },
    ],
  },
];

export default function BasketPage() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<BasketTemplate | null>(null);
  const [area, setArea] = useState("Kuala Lumpur");

  return (
    <>
      <TopBar title="BASKET ESTIMATOR" />
      <PageContainer className="space-y-6 pt-4">
        <div>
          <h2 className="font-mono text-sm text-text-primary">
            Compare basket costs across merchants
          </h2>
          <p className="text-text-secondary text-xs mt-1">
            Select a basket template to estimate your grocery spending.
          </p>
        </div>

        <AreaSelector value={area} onChange={setArea} />

        {/* Templates */}
        <div className="space-y-3">
          <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
            Basket Templates
          </div>
          {BASKET_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              glow={selectedTemplate?.id === template.id}
              className="cursor-pointer"
            >
              <button
                className="w-full text-left"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShoppingBasket
                        size={14}
                        className="text-neon"
                        aria-hidden="true"
                      />
                      <h3 className="font-mono text-sm text-text-primary">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-text-secondary text-xs mt-1 ml-6">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2 ml-6">
                      {template.items.slice(0, 4).map((item, i) => (
                        <Badge key={i} variant="muted">
                          {item.canonical_name.split(" ")[0]}
                        </Badge>
                      ))}
                      {template.items.length > 4 && (
                        <Badge variant="muted">
                          +{template.items.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      selectedTemplate?.id === template.id ? "neon" : "muted"
                    }
                  >
                    {template.items.length} items
                  </Badge>
                </div>
              </button>
            </Card>
          ))}
        </div>

        {/* Selected basket details */}
        {selectedTemplate && (
          <Card glow>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown
                size={14}
                className="text-neon"
                aria-hidden="true"
              />
              <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
                {selectedTemplate.name}
              </h3>
            </div>
            <div className="space-y-2">
              {selectedTemplate.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 border-b border-border last:border-0"
                >
                  <span className="text-xs text-text-secondary">
                    {item.canonical_name}
                  </span>
                  <span className="font-mono text-xs text-text-muted">
                    x{item.qty}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border text-center">
              <p className="text-[10px] font-mono text-text-muted">
                Price comparison requires price data in {area}. Scan receipts to
                contribute!
              </p>
            </div>
          </Card>
        )}
      </PageContainer>
    </>
  );
}
