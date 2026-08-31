export const metadata = {
  title: "Music Portfolio",
  description: "My Music Portfolio",
};
export default function MusicLayout({ children }) {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {children}
    </div>
  );
}