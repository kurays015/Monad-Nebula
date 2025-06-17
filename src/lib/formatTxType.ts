export const formatTransactionType = (type: string) => {
  return (
    type.charAt(0).toUpperCase() +
    type
      .slice(1)
      .replace(/([A-Z])/g, " $1")
      .trim()
  );
};
