export const metadata = {
  title: "Projects: AI Financial Dashboard",
  description: "My Music Portfolio",
};

export default function MusicLayout({ children }) {
  return (
       <div className="min-h-full flex flex-col">
         {children}
        </div>
  );
}