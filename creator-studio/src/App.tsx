import { Providers } from "./providers";
import { CreatorStudio } from "./components/CreatorStudio";
import "./index.css";

export default function App() {
  return (
    <Providers>
      <CreatorStudio />
    </Providers>
  );
}
