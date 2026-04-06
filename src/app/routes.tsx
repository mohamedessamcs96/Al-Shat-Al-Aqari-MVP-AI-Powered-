import { createBrowserRouter } from "react-router";
import { ChatInterface } from "./components/ChatInterface";
import { ListingDetail } from "./components/ListingDetail";
import { OfficeDashboard } from "./components/OfficeDashboard";
import { OfficeMiniPage } from "./components/OfficeMiniPage";
import { PublicOfficePage } from "./components/PublicOfficePage";
import { PageBuilder } from "./components/PageBuilder";
import { OfficeLeads } from "./components/OfficeLeads";
import { OfficeCampaigns } from "./components/OfficeCampaigns";
import { OfficeListings } from "./components/OfficeListings";
import { OfficeSubscription } from "./components/OfficeSubscription";
import { MiniPageEditor } from "./components/MiniPageEditor";
import { AdminConsole } from "./components/AdminConsole";
import { BuyerDashboard } from "./components/BuyerDashboard";
import { NegotiationView } from "./components/NegotiationView";
import { LoginPage } from "./components/LoginPage";
import { DemandForm } from "./components/DemandForm";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/chat",
    Component: ChatInterface,
  },
  {
    path: "/demand",
    Component: DemandForm,
  },
  {
    path: "/listings/:id",
    Component: ListingDetail,
  },
  {
    path: "/buyer/dashboard",
    Component: BuyerDashboard,
  },
  {
    path: "/buyer/negotiations/:id",
    Component: NegotiationView,
  },
  {
    path: "/office/dashboard",
    Component: OfficeDashboard,
  },
  {
    path: "/office/leads",
    Component: OfficeLeads,
  },
  {
    path: "/office/campaigns",
    Component: OfficeCampaigns,
  },
  {
    path: "/office/listings",
    Component: OfficeListings,
  },
  {
    path: "/office/subscription",
    Component: OfficeSubscription,
  },
  {
    path: "/office/mini-page-editor",
    Component: MiniPageEditor,
  },
  {
    path: "/office/page-builder",
    Component: PageBuilder,
  },
  {
    path: "/admin/login",
    Component: LoginPage,
  },
  {
    path: "/admin/dashboard",
    Component: AdminConsole,
  },
  {
    path: "/office/:slug",
    Component: PublicOfficePage,
  },
  {
    // Keep old route for backwards compat
    path: "/office-legacy/:slug",
    Component: OfficeMiniPage,
  },
]);
