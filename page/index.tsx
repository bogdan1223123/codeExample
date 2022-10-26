import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { lang } from "../public/locales/lang";
import { calendarEventsRepository } from "../src/api/calendarEventsRepository";
import { EventEntityDto } from "../src/api/dto/EventEntity";
import { IBlocksOfMatch } from "../src/api/dto/IBlocksOfMatch";
import { IMediaShort, listFieldMediaShort } from "../src/api/dto/IMedia";
import { IProduct } from "../src/api/dto/IProduct";
import { ITeam } from "../src/api/dto/ITeam";
import { ITournamentAndSeasons } from "../src/api/dto/ITournamentAndSeasons";
import { ITournamentTable } from "../src/api/dto/ITournamentTable";
import { VotingEntity } from "../src/api/dto/voting";
import { matchRepository } from "../src/api/matchRepository";
import { mediaRepository } from "../src/api/mediaRepository";
import { mvpVotingRepository, VotingType } from "../src/api/MvpVotingRepository";
import { shopRepository } from "../src/api/shopRepository";
import { BottomBanner } from "../src/componentPages/pageMain/bottomBanner/bottomBanner";
import { Calendar } from "../src/componentPages/pageMain/calendar/calendar";
import { ClubTrophies } from "../src/componentPages/pageMain/clubTrophies/clubTrophies";
import { PageMainNews } from "../src/componentPages/pageMain/mainPageNews/pageMainNews";
import { Matches } from "../src/componentPages/pageMain/matches/matches";
import { MatchesVideo } from "../src/componentPages/pageMain/matchsVideo/matchsVideo";
import { ShopSwiper } from "../src/components/reactSwiper/shopSwiper";
import { Subscribe } from "../src/componentPages/pageMain/subscribe/subscribe";
import { TournamentTable } from "../src/componentPages/pageMain/tournamentTable/TournamentTable";
import { GetLayout } from "../src/components/layout/getLayout";
import { MediaBanner } from "../src/components/mediaBanner";
import { SwiperWithBigActiveElem } from "../src/components/reactSwiper/swiperWithBigActiveElem";
import { getDataByTeamId, getInitialData } from "../src/core/getInitialData";
import styled from "styled-components";

interface IProps {
  shopProductList?: IProduct[];
  newsList?: IMediaShort[];
  videoList?: IMediaShort[];
  blockOfMatches?: IBlocksOfMatch;
  events?: Record<number, EventEntityDto[]>;
  tournamentsAndSeasons?: ITournamentAndSeasons[];
  tableData?: ITournamentTable[] | null;
  team?: ITeam;
  votings?: VotingEntity[];
}

export default function Index(props: IProps) {
  const { locale = "ru" } = useRouter();

  return (
    <>
      <Matches showScroll blockOfMatches={props.blockOfMatches || {}} teamId={props.team?.Id} />
      <Calendar events={props.events || {}} voting={(props.votings || [])[0]} />
      <PageMainNews newsList={props.newsList || []} />
      <TournamentTable
        tournaments={props.tournamentsAndSeasons || []}
        tableData={props.tableData || []}
        team={props.team}
      />
      <SwiperWithBigActiveElem title={lang[locale].mainPage.specialOffers} />
      <Subscribe />
      <MatchesVideo videoList={props.videoList || []} />
      <MediaBanner locationKey="Web.Main.Video" />
      {!!props.shopProductList?.length && (
        <ShopSwiper
          itemsList={props.shopProductList}
          title={lang[locale].profile.denariiPage.cartInfo.purchases.shop}
        />
      )}
      <ClubTrophies />
      <StyledBottomBanner>
        <BottomBanner
          title={"Стань ближе к своей любимой команде"}
          text={
            "Download the app to manage your projects, keep track of the progress and complete tasks without procrastinating. Stay on track and complete on time!"
          }
          img={"/images/banners/bgMainL.jpg"}
          appStoreUrl="/"
          googlePlayUrl="/"
        />
      </StyledBottomBanner>
    </>
  );
}

Index.getLayout = GetLayout;

const isDev = process.env.NODE_ENV !== "production";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  isDev && console.log("\r\n\r\n", "\x1b[34m", "start", "/index", new Date());

  const { metaTags = {}, teams = [] } = await getInitialData({ pathname: "/" });

  const team = teams[0] || null;
  const teamId = team?.Id;
  const instatId = team?.InStatId?.toString();

  if (!teamId) return { props: {} };

  const { tournamentsAndSeasons = [], blockOfMatches = {} } = await getDataByTeamId({ teamId });
  const { Tournament = {}, Seasons = [] } = tournamentsAndSeasons[0] || {};

  const [shopProductList, newsRes, videoRes, eventsRes, votingRes, calendarRes] = await Promise.allSettled([
    shopRepository.fetchShopProductList({ locale }),
    mediaRepository.fetchMedia(
      {
        MediaType: "News",
        IsDraft: "false",
        PublishDateTime: true,
        currentPage: 1,
        pageSize: 6,
        sorting: "PublishDateTime desc",
        Section: "Site",
        MediaHeader: locale,
      },
      listFieldMediaShort
    ),
    mediaRepository.fetchMedia(
      {
        MediaType: "Video",
        IsDraft: "false",
        PublishDateTime: true,
        sorting: "PublishDateTime desc",
        Section: "Site",
      },
      listFieldMediaShort
    ),
    calendarEventsRepository.fetchCalendarEvents({ teamId }),
    mvpVotingRepository.fetchVotings({ mvpVotingType: VotingType.month }),
    matchRepository.fetchCalendar({
      teamId,
      tournamentId: Tournament.Id,
      seasonId: Seasons[0]?.Id,
      matchListType: "All",
      Status: "Published",
    }),
  ]);

  const events =
    eventsRes.status === "fulfilled"
      ? eventsRes.value.reduce((acc: Record<number, EventEntityDto[]>, event: EventEntityDto) => {
          const date = new Date(event.DateStart);
          const key = +Date.UTC(date.getFullYear(), date.getMonth());
          return acc[key] ? { ...acc, [key]: [...acc[key], event] } : { ...acc, [key]: [event] };
        }, {})
      : {};

  const isPlayOff =
    calendarRes.status === "fulfilled" ? calendarRes.value.some(({ Round }) => Round?.IsPlayOff) : false;

  const tableData =
    !isPlayOff && Seasons
      ? await matchRepository
          .fetchTournamentTable({
            tournamentId: Tournament.Id,
            seasonId: Seasons[0]?.Id,
            teamId,
          })
          .then((res) => {
            let result: ITournamentTable[] = res.map((elem, index) =>
              elem.Team?.Id === instatId ? { ...elem, index: index + 1, active: true } : { ...elem, index: index + 1 }
            );

            res.find((item, index) => {
              if (item.Team?.Id === instatId) {
                if (index < 4) {
                  result = result.slice(0, 5);
                } else if (index > res.length - 3) {
                  result = result.slice(-5);
                } else {
                  result = result.slice(index - 2, index + 3);
                }
                return true;
              }
              return false;
            });

            return result;
          })
      : null;

  isDev && console.log("\x1b[34m", "done", "/index", new Date(), "\r\n");

  return {
    props: {
      shopProductList: shopProductList.status === "fulfilled" ? shopProductList.value || [] : [],
      newsList: newsRes.status === "fulfilled" ? newsRes.value.value || [] : [],
      videoList: videoRes.status === "fulfilled" ? videoRes.value.value || [] : [],
      blockOfMatches,
      events,
      tournamentsAndSeasons,
      tableData,
      team,
      metaTags,
      votings: votingRes.status === "fulfilled" ? votingRes.value || [] : [],
    },
  };
};

const StyledBottomBanner = styled.article`
  & > div {
    background-color: ${({ theme }) => theme.colors.none_black};
  }
`;
