export const metadata = {
  title: "Music Portfolio",
  description: "My Music Portfolio",
};

export default function MusicLayout({ children }) {
  return (
       <div className="min-h-full flex flex-col">
         {children}
        </div>
  );
}