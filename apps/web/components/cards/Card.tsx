export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="card border rounded p-6 shadow-md bg-white">
      {children}
    </div>
  );
}