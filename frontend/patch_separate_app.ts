import { readFile, writeFile } from "node:fs/promises";

async function run() {
  const appPath = "d:/Documents/Projects/Figma/FoodApp/ResQ/frontend/App.tsx";
  let code = await readFile(appPath, "utf8");

  // 1. Clean previous imports
  const oldImportRegex = /import StoreLocationScreen from "\.\/src\/screens\/StoreLocationScreen";[\s\S]*?import type { FoodSafetyDetail, SpotReservationResult, DepositPaymentResult } from "\.\/src\/services\/foodSafetyReservationApi";/;
  
  const newImports = `import StoreLocationScreen from "./src/screens/StoreLocationScreen";
// Module 3 Individual Screens (US-C1 -> C3)
import FoodSafetyCountdownScreen from "./src/screens/FoodSafetyCountdownScreen";
import ActualProductLabelScreen from "./src/screens/ActualProductLabelScreen";
import ExpirationInfoScreen from "./src/screens/ExpirationInfoScreen";
import StorageInstructionsScreen from "./src/screens/StorageInstructionsScreen";
import ReheatingInstructionsScreen from "./src/screens/ReheatingInstructionsScreen";
import RefrigerationRequirementScreen from "./src/screens/RefrigerationRequirementScreen";
import ExpirationWarningScreen from "./src/screens/ExpirationWarningScreen";
import FoodOriginInfoScreen from "./src/screens/FoodOriginInfoScreen";
import SellerCommitmentScreen from "./src/screens/SellerCommitmentScreen";
import TermsComplaintRightsScreen from "./src/screens/TermsComplaintRightsScreen";
import ComplaintRefundPolicyScreen from "./src/screens/ComplaintRefundPolicyScreen";

// Module 4 Individual Screens (US-D1 -> D4)
import MealDetailReservationScreen from "./src/screens/MealDetailReservationScreen";
import ConfirmSpotReservationScreen from "./src/screens/ConfirmSpotReservationScreen";
import ReservationTimeScreen from "./src/screens/ReservationTimeScreen";
import YourOrderWaitingScreen from "./src/screens/YourOrderWaitingScreen";
import ConfirmDepositScreen from "./src/screens/ConfirmDepositScreen";
import PayDepositScreen from "./src/screens/PayDepositScreen";
import DepositReceiptScreen from "./src/screens/DepositReceiptScreen";
import PickupTimeSlotScreen from "./src/screens/PickupTimeSlotScreen";
import OrderDetailsSlotScreen from "./src/screens/OrderDetailsSlotScreen";
import WaitlistQueueScreen from "./src/screens/WaitlistQueueScreen";
import OverdueOrderScreen from "./src/screens/OverdueOrderScreen";
import CancelReleaseScreen from "./src/screens/CancelReleaseScreen";
import type { FoodSafetyDetail } from "./src/services/foodSafetyReservationApi";`;

  code = code.replace(oldImportRegex, newImports);

  // 2. Update Page Type
  const pageRegex = /\| "sellerProfile"[\s\S]*?\| "waitlistQueue";/;
  const newPageList = `| "sellerProfile"
  // Module 3
  | "foodSafetyCountdown"
  | "actualProductLabel"
  | "expirationInfo"
  | "storageInstructions"
  | "reheatingInstructions"
  | "refrigerationRequirement"
  | "expirationWarning"
  | "foodOriginInfo"
  | "sellerCommitment"
  | "termsComplaintRights"
  | "complaintRefundPolicy"
  // Module 4
  | "mealDetailReservation"
  | "confirmSpotReservation"
  | "reservationTime"
  | "yourOrderWaiting"
  | "confirmDeposit"
  | "payDeposit"
  | "depositReceipt"
  | "pickupTimeSlot"
  | "orderDetailsSlot"
  | "waitlistQueue"
  | "overdueOrder"
  | "cancelRelease";`;

  code = code.replace(pageRegex, newPageList);

  // 3. Replace the render view switch
  const renderRegex = /{\/\* ===================================== \*\/}[\s\S]*?{page === "safety" && \(/;

  const newRenderBlock = `{/* ===================================== */}
        {/* MODULE 3: INDIVIDUAL SCREENS (FIGMA) */}
        {/* ===================================== */}
        {page === "foodSafetyCountdown" && (
          <FoodSafetyCountdownScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "actualProductLabel" && (
          <ActualProductLabelScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "expirationInfo" && (
          <ExpirationInfoScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "storageInstructions" && (
          <StorageInstructionsScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "reheatingInstructions" && (
          <ReheatingInstructionsScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "refrigerationRequirement" && (
          <RefrigerationRequirementScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "expirationWarning" && (
          <ExpirationWarningScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "foodOriginInfo" && (
          <FoodOriginInfoScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "sellerCommitment" && (
          <SellerCommitmentScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "termsComplaintRights" && (
          <TermsComplaintRightsScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "complaintRefundPolicy" && (
          <ComplaintRefundPolicyScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}

        {/* ===================================== */}
        {/* MODULE 4: INDIVIDUAL SCREENS (FIGMA) */}
        {/* ===================================== */}
        {page === "mealDetailReservation" && (
          <MealDetailReservationScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "confirmSpotReservation" && (
          <ConfirmSpotReservationScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "reservationTime" && (
          <ReservationTimeScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "yourOrderWaiting" && (
          <YourOrderWaitingScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "confirmDeposit" && (
          <ConfirmDepositScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "payDeposit" && (
          <PayDepositScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "depositReceipt" && (
          <DepositReceiptScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "pickupTimeSlot" && (
          <PickupTimeSlotScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "orderDetailsSlot" && (
          <OrderDetailsSlotScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "waitlistQueue" && (
          <WaitlistQueueScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "overdueOrder" && (
          <OverdueOrderScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}
        {page === "cancelRelease" && (
          <CancelReleaseScreen onBack={() => goBack()} onNavigate={(r) => navigateTo(r as Page)} />
        )}

        {page === "safety" && (`;

  code = code.replace(renderRegex, newRenderBlock);

  await writeFile(appPath, code, "utf8");
  console.log("App.tsx configured with all separate screen components!");
}

run().catch(console.error);

