import React from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";

export const CARD_VALUES = ["1", "2", "3", "5", "8", "13", "21", "34", "?", "☕"];

type PokerCardsProps = {
  selectedCards: string[];
  reveal: boolean;
  onSelect: (card: string) => void;
};

const PokerCards = ({ selectedCards, reveal, onSelect }: PokerCardsProps) => (
  <div className="card-grid">
    {CARD_VALUES.map((card) => {
      const isSelected = selectedCards.includes(card);
      const className = [
        "poker-card",
        isSelected ? "selected" : "",
        reveal ? "revealed" : ""
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <Card
          key={card}
          className={className}
          sx={{ width: { xs: 40, sm: 80 }, height: { xs: 55, sm: 110 } }}
        >
          <CardActionArea onClick={() => onSelect(card)} sx={{ height: "100%" }}>
            <CardContent sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="h6" fontWeight={700}>
                {card}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      );
    })}
  </div>
);

export default PokerCards;
