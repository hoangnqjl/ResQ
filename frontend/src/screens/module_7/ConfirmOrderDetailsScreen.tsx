import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FallbackPhoto } from "../../components/FallbackPhoto";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";
import type { CommunityFood } from "../../services/communityApi";

type Props = {
  food: CommunityFood;
  onBack: () => void;
  onOrderNow: () => void;
  onDeposit: () => void;
};

const money = (value: number) => `$${(value / 28000).toFixed(2)}`;

export default function ConfirmOrderDetailsScreen({ food, onBack, onOrderNow, onDeposit }: Props) {
  const price = Number(food.current_price ?? 0);
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.iconButton}><Ionicons name="chevron-back" size={21} color={s.ink.color} /></Pressable>
        <Text style={s.title}>Confirm Order Details</Text>
        <Pressable onPress={onBack} style={s.iconButton}><Ionicons name="close" size={20} color={s.ink.color} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <View style={s.shopRow}><Ionicons name="storefront-outline" size={21} color={s.primary.color} /><Text style={s.shopName}>{food.shop_name || "The Corner Kitchen"}</Text></View>
          <View style={s.foodRow}>
            <FallbackPhoto uri={imageUrl(food.image_url)} fallback={foodPhoto(food.name)} style={s.photo} />
            <View style={s.foodInfo}><Text style={s.foodName}>{food.name}</Text><Text style={s.price}>{money(price)}</Text></View>
            <Text style={s.quantity}>×1</Text>
          </View>
          <Pressable style={s.voucher} onPress={() => {}}><Ionicons name="pricetag-outline" size={17} color={s.primary.color}/><Text style={s.voucherText}>Applied voucher</Text><View style={s.voucherPill}><Text style={s.voucherPillText}>Freeship</Text></View></Pressable>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Payment</Text>
          <Pressable style={s.row} onPress={() => {}}><Ionicons name="cash-outline" size={20} color={s.primary.color}/><Text style={s.rowLabel}>Payment Method</Text><Text style={s.rowValue}>Cash on Delivery</Text><Ionicons name="chevron-down" size={17} color={s.muted.color}/></Pressable>
          <Pressable style={s.row} onPress={() => {}}><Ionicons name="receipt-outline" size={20} color={s.primary.color}/><Text style={s.rowLabel}>Payment Details</Text><Ionicons name="chevron-down" size={17} color={s.muted.color}/></Pressable>
          <View style={s.totalRow}><Text style={s.totalLabel}>Food subtotal (1 item)</Text><Text style={s.totalValue}>{money(price)}</Text></View>
          <View style={s.totalRow}><Text style={s.totalLabel}>Delivery fee</Text><Text style={s.totalValue}>+$2.55</Text></View>
          <View style={s.totalRow}><Text style={s.totalLabel}>Discount voucher</Text><Text style={s.totalValue}>−$2.12</Text></View>
          <View style={s.grandTotal}><Text style={s.grandLabel}>Total (after discount)</Text><Text style={s.grandValue}>{money(Math.max(0, price + 71500 - 59360))}</Text></View>
        </View>

        <View style={s.addressCard}>
          <View style={s.pin}><Ionicons name="location" size={22} color={s.primary.color}/></View>
          <View style={s.addressInfo}><Text style={s.addressName}>Truong Viet Bac</Text><Text style={s.addressText}>{food.address || "Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng"}</Text><Text style={s.addressText}> (+84) 0123456789</Text></View>
          <Ionicons name="chevron-forward" size={18} color={s.muted.color}/>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <Pressable style={s.primaryButton} onPress={onDeposit}><Text style={s.primaryButtonText}>Deposit</Text></Pressable>
        <Pressable style={s.secondaryButton} onPress={onOrderNow}><Text style={s.secondaryButtonText}>Order Now</Text></Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:"#fff"},header:{height:58,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:20,borderBottomWidth:1,borderBottomColor:"#edf0ec"},iconButton:{width:38,height:38,borderRadius:22,borderWidth:1,borderColor:"#dfe7dd",alignItems:"center",justifyContent:"center"},title:{fontSize:17,fontWeight:"700",color:"#19372a"},content:{paddingHorizontal:20,paddingTop:20,paddingBottom:120,gap:14},card:{borderWidth:1,borderColor:"#dfe7dd",borderRadius:18,padding:16,backgroundColor:"#fff"},shopRow:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:12},shopName:{fontSize:15,fontWeight:"700",color:"#19372a"},foodRow:{flexDirection:"row",alignItems:"center",gap:12},photo:{width:110,height:90,borderRadius:12,backgroundColor:"#eef3ed"},foodInfo:{flex:1,justifyContent:"center",gap:8},foodName:{fontSize:14,fontWeight:"600",color:"#19372a"},price:{fontSize:13,color:"#667469"},quantity:{fontSize:13,color:"#19372a",alignSelf:"flex-start",marginTop:4},voucher:{flexDirection:"row",alignItems:"center",gap:9,marginTop:16,borderTopWidth:1,borderTopColor:"#edf0ec",paddingTop:13},voucherText:{fontSize:13,fontWeight:"600",color:"#19372a",flex:1},voucherPill:{backgroundColor:"#176b46",borderRadius:20,paddingVertical:5,paddingHorizontal:12},voucherPillText:{color:"#fff",fontSize:11,fontWeight:"700"},sectionTitle:{fontSize:15,fontWeight:"700",color:"#19372a",marginBottom:8},row:{minHeight:40,flexDirection:"row",alignItems:"center",gap:10},rowLabel:{fontSize:12,fontWeight:"600",color:"#19372a",flex:1},rowValue:{fontSize:12,color:"#667469"},totalRow:{flexDirection:"row",justifyContent:"space-between",paddingVertical:5},totalLabel:{fontSize:12,color:"#667469"},totalValue:{fontSize:12,color:"#667469"},grandTotal:{flexDirection:"row",justifyContent:"space-between",backgroundColor:"#e8f3e9",borderRadius:9,padding:11,marginTop:8},grandLabel:{fontSize:12,fontWeight:"600",color:"#19372a"},grandValue:{fontSize:13,fontWeight:"700",color:"#19372a"},addressCard:{minHeight:96,borderWidth:1,borderColor:"#dfe7dd",borderRadius:18,padding:14,flexDirection:"row",alignItems:"center",gap:12},pin:{height:48,width:48,borderRadius:24,backgroundColor:"#e8f3e9",alignItems:"center",justifyContent:"center"},addressInfo:{flex:1,gap:4},addressName:{fontSize:14,fontWeight:"700",color:"#19372a"},addressText:{fontSize:11,color:"#667469"},footer:{position:"absolute",bottom:0,left:0,right:0,flexDirection:"row",gap:12,paddingHorizontal:20,paddingTop:10,paddingBottom:14,backgroundColor:"#fff"},primaryButton:{height:48,flex:1,borderRadius:25,backgroundColor:"#176b46",alignItems:"center",justifyContent:"center"},primaryButtonText:{color:"#fff",fontSize:15,fontWeight:"700"},secondaryButton:{height:48,flex:1,borderRadius:25,borderWidth:1,borderColor:"#176b46",alignItems:"center",justifyContent:"center"},secondaryButtonText:{color:"#19372a",fontSize:15,fontWeight:"700"},ink:{color:"#19372a"},primary:{color:"#176b46"},muted:{color:"#667469"}
});
