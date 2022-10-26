import Head from "next/head";
import { useRouter } from "next/router";
import { getLocalValue } from "../assets/helpers/getLocalValue";
import { LocaleType } from "../assets/interfaces/LocaleType";
import { IMetaTags } from "../assets/interfaces/metaTags";

interface IProps {
  metaTags?: IMetaTags | null;
}

export const BaseMeta = ({ metaTags }: IProps) => {
  const { locale = "ru" } = useRouter();

  return (
      <Head>
        <title>{getLocalValue(metaTags?.titleName, locale)}</title>
        <meta property="og:title" content={getLocalValue(metaTags?.titleOg, locale)} key="title" />
        <meta property="og:image" content={getLocalValue(metaTags?.imageOg, locale)} key="image" />
        <meta property="og:type" content={getLocalValue(metaTags?.typeOg, locale)} key="type" />
        <meta property="og:description" content={getLocalValue(metaTags?.descriptionOg, locale)} key="description" />
        <meta property="og:locale" content={getLocalValue(metaTags?.localeOg, locale)} key="locale" />
      </Head>
  );
};
