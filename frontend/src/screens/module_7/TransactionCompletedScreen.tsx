import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FallbackPhoto } from "../../components/FallbackPhoto";
import { foodPhoto } from "../../data/designPhotos";
import { imageUrl } from "../../services/communityApi";
import type { CommunityFood } from "../../services/communityApi";

type Props = { food: CommunityFood; onBack: () => void; onViewOrders: () => void };
const money = (value: number) => `$${(value / 28000).toFixed(2)}`;

export default function TransactionCompletedScreen({ food, onBack, onViewOrders }: Props) {
  return (
    <View style={s.root}>
      <View style={s.header}><Pressable onPress={onBack} style={s.icon}><Ionicons name="chevron-back" size={21} color="#19372a"/></Pressable><Text style={s.title}>Transaction Completed</Text><View style={{width:38}}/></View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.success}><View style={s.check}><Ionicons name="checkmark" size={34} color="#fff"/></View><Text style={s.heading}>Order Completed!</Text><Text style={s.code}>Order Code: #ORD-84920 • Time: Today, 20:45</Text></View>
        <View style={s.card}>
          <Text style={s.section}>Delivery to</Text><Text style={s.name}>Truong Viet Bac</Text><Text style={s.muted}>Tổ 1, Phường Ngũ Hành Sơn, Đà Nẵng</Text><Text style={s.muted}>(+84) 0123456789</Text>
        </View>
        <View style={s.card}>
          <View style={s.shop}><Ionicons name="storefront-outline" size={20} color="#176b46"/><Text style={s.name}>{food.shop_name || "The Corner Kitchen"}</Text></View>
          <View style={s.food}><FallbackPhoto uri={imageUrl(food.image_url)} fallback={foodPhoto(food.name)} style={s.photo}/><View style={{flex:1}}><Text style={s.name}>{food.name}</Text><Text style={s.muted}>×1</Text></View><Text style={s.muted}>{money(Number(food.current_price ?? 0))}</Text></View>
          <View style={s.line}/><View style={s.total}><Text style={s.name}>Total Paid:</Text><Text style={s.totalValue}>{money(Number(food.current_price ?? 0))}</Text></View>
        </View>
        <View style={s.card}><Text style={s.section}>Payment method</Text><View style={s.payment}><Ionicons name="cash-outline" size={19} color="#176b46"/><Text style={s.muted}>Cash on Delivery</Text></View></View>
      </ScrollView>
      <View style={s.footer}><Pressable onPress={onBack} style={s.secondary}><Text style={s.secondaryText}>Reorder</Text></Pressable><Pressable onPress={onViewOrders} style={s.primary}><Text style={s.primaryText}>View order list</Text></Pressable></View>
    </View>
  );
}

const s=StyleSheet.create({root:{flex:1,backgroundColor:"#fff"},header:{height:58,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:20,borderBottomWidth:1,borderBottomColor:"#edf0ec"},icon:{width:38,height:38,borderRadius:22,borderWidth:1,borderColor:"#dfe7dd",alignItems:"center",justifyContent:"center"},title:{fontSize:17,fontWeight:"700",color:"#19372a"},content:{padding:20,paddingBottom:100,gap:14},success:{alignItems:"center",paddingVertical:18},check:{width:64,height:64,borderRadius:32,backgroundColor:"#176b46",alignItems:"center",justifyContent:"center",marginBottom:12},heading:{fontSize:22,fontWeight:"800",color:"#19372a"},code:{fontSize:12,color:"#667469",marginTop:8,textAlign:"center"},card:{borderWidth:1,borderColor:"#dfe7dd",borderRadius:18,padding:16,gap:7},section:{fontSize:14,fontWeight:"700",color:"#19372a",marginBottom:3},name:{fontSize:13,fontWeight:"600",color:"#19372a"},muted:{fontSize:12,color:"#667469"},shop:{flexDirection:"row",alignItems:"center",gap:9,marginBottom:8},food:{flexDirection:"row",alignItems:"center",gap:12},photo:{width:72,height:72,borderRadius:11,backgroundColor:"#eef3ed"},line:{height:1,backgroundColor:"#dfe7dd",marginVertical:8},total:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},totalValue:{fontSize:17,fontWeight:"800",color:"#176b46"},payment:{flexDirection:"row",alignItems:"center",gap:10},footer:{position:"absolute",bottom:0,left:0,right:0,flexDirection:"row",gap:12,paddingHorizontal:20,paddingTop:10,paddingBottom:14,backgroundColor:"#fff"},secondary:{height:48,flex:1,borderRadius:25,borderWidth:1,borderColor:"#176b46",alignItems:"center",justifyContent:"center"},secondaryText:{color:"#19372a",fontSize:14,fontWeight:"700"},primary:{height:48,flex:1,borderRadius:25,backgroundColor:"#176b46",alignItems:"center",justifyContent:"center"},primaryText:{color:"#fff",fontSize:14,fontWeight:"700"}});
