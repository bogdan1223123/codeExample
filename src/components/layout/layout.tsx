import React, { FC, memo } from "react";
import styled from "styled-components";
import { theme } from "../../assets/theme/theme";
import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { IMetaTags } from "../../assets/interfaces/metaTags";
import { BaseMeta } from "../baseMeta";

interface IProps {
  metaTags?: IMetaTags | null;
}

export const Layout: FC<IProps> = memo(({ children, metaTags }) => {
  return (
    <>
      <BaseMeta metaTags={metaTags} />
      <Header />
      <MainContainer>{children}</MainContainer>
      <Footer />
    </>
  );
});

const MainContainer = styled.main`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colors.black_white};
  font-family: "Roboto", sans-serif;
  overflow-x: hidden;
  min-height: 92vh;
  padding-top: 5.52vw;

  @media screen and (max-width: ${theme.rubberSize.desktop}) {
    padding-top: 0;
  }
`;
