import Head from "next/head";

const Metatags = ({ title, keywords, description, image }) => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link rel="icon" href="/favicon.ico" />

      <title>
        {title
          ? title + " - Mesh Playground by Martify Labs"
          : "Mesh Playground by Martify Labs"}
      </title>

      <meta name="keywords" content={keywords} />
      <meta name="description" content={description} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@MartifyLabs" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
    </Head>
  );
};

Metatags.defaultProps = {
  title: null,
  keywords:
    "cardano, blockchain, solutions, plutus, eutxo, crypto, web3, metaverse, gaming, ecommerce, nfts, apis",
  description:
    "Intuitive and easy-to-use tools and services to creators and companies who plan to build on Cardano.",
  image: null,
};

export default Metatags;
