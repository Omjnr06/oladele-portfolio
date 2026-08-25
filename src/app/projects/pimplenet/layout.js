export const metadata = {
  title: "Internship Project: Pimplenet",
};

export default function MusicLayout({ children }) {
  return (
       <div className="min-h-full flex flex-col">
         {children}
        </div>
  );
}