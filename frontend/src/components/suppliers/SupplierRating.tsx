import React from "react";
import { Star } from "lucide-react";

interface SupplierRatingProps {
  rating: number | null | undefined;
}

export default function SupplierRating({ rating }: SupplierRatingProps) {
  if (rating === null || rating === undefined) {
    return <span className="text-secondary/40 italic text-xs">No rating</span>;
  }

  // Round rating to the nearest integer
  const roundedRating = Math.round(rating);

  return (
    <div className="flex items-center space-x-0.5" title={`Rating: ${rating}/5`}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= roundedRating;
        return (
          <Star
            key={starIndex}
            className={`h-4 w-4 ${
              isFilled
                ? "text-amber-400 fill-amber-400"
                : "text-secondary/30"
            }`}
          />
        );
      })}
    </div>
  );
}
