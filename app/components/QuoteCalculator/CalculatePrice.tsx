type Office = {
  from: string;
  to: string;
  method: string;
  currency: string;
  clearance_currency: string | null;
  divisor: number;
  rates: number[];
  clearance: number[] | null;
};

const offices: Office[] = [
  {
    from: "lagos",
    to: "toronto",
    method: "air",
    currency: "₦",
    clearance_currency: "$",
    divisor: 10,
    rates: [6000, 5600, 5600, 5600, 5600, 5600, 5600, 5600, 5600, 5500],
    clearance: [20, 2, 2, 2, 2, 2, 2, 2, 2, 1.5],
  },
  {
    from: "toronto",
    to: "lagos",
    method: "air",
    currency: "$",
    clearance_currency: null,
    divisor: 5,
    rates: [20, 15, 12],
    clearance: null,
  },
  {
    from: "toronto",
    to: "lagos",
    method: "ocean",
    currency: "$",
    clearance_currency: null,
    divisor: 0,
    rates: [300, 370],
    clearance: null,
  },
];


export function CalculatePriceAir(from: string, to: string, weight: number) {
  const office = offices.find(
    (office) =>
      office.from === from && office.to === to && office.method === "air"
  );
  if (!office) {
    return null;
  }

  const rate = office.rates.at(
    Math.min(Math.floor(weight / office.divisor) - 1, office.rates.length - 1)
  );
  const clearance =
    office.clearance &&
    office.clearance.at(
      Math.min(
        Math.floor(weight / office.divisor) - 1,
        office.clearance.length - 1
      )
    );

  return {
    price: `${office.currency}${weight * rate!}`,
    clearance:
      office.clearance &&
      `${office.clearance_currency}${clearance && weight * clearance}`,
  };
}

export function CalculatePriceOcean(
  from: string,
  to: string,
  small: number,
  large: number
) {
  const office = offices.find(
    (office) =>
      office.from === from && office.to === to && office.method === "ocean"
  );
  if (!office) {
    return null;
  }
  console.log(office);

  return {
    price: `${office.currency}${
      small * office.rates.at(0)! + large * office.rates.at(1)!
    }`,
    clearance:
      office.clearance &&
      `${office.clearance_currency}${
        small * office.clearance.at(0)! + large * office.clearance.at(1)!
      }`,
  };
}
