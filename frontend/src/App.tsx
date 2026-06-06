import { StoreProvider } from './state/store';
import { Layout } from './components/Layout';
import { ThemeProvider } from './theme';

export function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <Layout />
      </StoreProvider>
    </ThemeProvider>
  );
}
