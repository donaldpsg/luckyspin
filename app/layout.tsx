import { Provider } from "@/components/ui/provider";

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <html suppressHydrationWarning>
      <body
        style={{ backgroundImage: "url(images/background.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
