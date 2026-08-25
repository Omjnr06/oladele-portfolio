export const metadata = {
  title: " Oladele Magbadelo Resume",
  description: "My Resume",
};

export default function MusicLayout({ children }) {
  return (
       <div className="min-h-full flex flex-col">
         {children}
        </div>
  );
}