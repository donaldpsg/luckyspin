import { Provider } from "@/components/ui/provider";

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <html suppressHydrationWarning>
      <body style={{ backgroundColor: "#f8faef" }}>
        <Provider forcedTheme="light">{children}</Provider>
      </body>
    </html>
  );
}
