import dynamic from "next/dynamic";
import ContentLoader from "./ContentLoader";
const Home = dynamic(() => import("@/app/page"), {
  loading: () => (
    <div className="h-96">
      <ContentLoader />
    </div>
  ),
  ssr: false,
});

export default Home;
