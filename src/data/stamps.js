'use strict';
/* ============================== dữ liệu tem trong Sổ tem ============================== */
/* sprite = tên sprite trong atlas (nếu chưa có thì vẽ dấu ?). text = vài câu về thứ có thật. */
const STAMP_GROUPS=['Vùng miền','Cây cầu','Địa danh','Món ăn','Con vật','Ban đêm','Hành trình'];
const STAMPS=[
  /* Vùng miền */
  {id:'r_dbsh',group:'Vùng miền',title:'Đồng bằng sông Hồng',sprite:'lua',text:'Vùng đồng bằng châu thổ rộng lớn quanh sông Hồng, nơi có làng quê với cổng làng, đình làng, cây đa và những cánh đồng lúa.'},
  {id:'r_tb',group:'Vùng miền',title:'Tây Bắc',sprite:'bacthang',text:'Vùng núi cao phía tây bắc, nổi tiếng với ruộng bậc thang, nhà sàn và nhiều dân tộc cùng sinh sống.'},
  {id:'r_ntb',group:'Vùng miền',title:'Nam Trung Bộ',sprite:'thapcham',text:'Dải đất ven biển miền Trung nắng gió, có tháp Chàm cổ, phố cổ Hội An và những chiếc thuyền thúng.'},
  {id:'r_tn',group:'Vùng miền',title:'Tây Nguyên',sprite:'nharong',text:'Cao nguyên đất đỏ bazan với cà phê, cao su, nhà rông và tiếng cồng chiêng của các dân tộc bản địa.'},
  {id:'r_dnb',group:'Vùng miền',title:'Đông Nam Bộ',sprite:'caooc',text:'Vùng đất năng động quanh Sài Gòn, nơi rừng cao su xanh ngát nằm cạnh những toà nhà cao tầng.'},
  {id:'r_tnb',group:'Vùng miền',title:'Tây Nam Bộ',sprite:'dua',text:'Miền sông nước đồng bằng sông Cửu Long với kênh rạch chằng chịt, vườn trái cây và chợ nổi trên sông.'},
  /* Cây cầu */
  {id:'cau_ngoi',group:'Cây cầu',title:'Cầu ngói',sprite:'cau_ngoi',text:'Cầu có mái ngói che mưa nắng, người làng vừa đi lại vừa ngồi hóng mát. Cầu ngói chợ Lương ở Hải Hậu, Nam Định là một cây cầu như vậy.'},
  {id:'cau_dua',group:'Cây cầu',title:'Cầu khỉ',sprite:'cau_dua',text:'Cầu bắc bằng thân dừa hay tre qua kênh rạch miền Tây, hẹp và chênh vênh, đi phải giữ thăng bằng.'},
  {id:'chua_cau',group:'Cây cầu',title:'Chùa Cầu Hội An',sprite:'chua_cau',text:'Cây cầu có mái che ở phố cổ Hội An, do thương nhân người Nhật xây từ thế kỷ 17 và gắn liền với hình ảnh của Hội An.'},
  {id:'cau_treo',group:'Cây cầu',title:'Cầu treo',sprite:'cau_treo',text:'Cầu treo dây thép bắc qua suối và khe núi, giúp bà con vùng cao đi lại giữa các bản làng.'},
  {id:'cau_sat',group:'Cây cầu',title:'Cầu sắt',sprite:'cau_sat',text:'Những cây cầu dầm sắt bắc qua sông, kênh ở vùng đô thị phía nam, nơi xe cộ và người qua lại tấp nập.'},
  /* Địa danh */
  {id:'dinh',group:'Địa danh',title:'Đình làng',sprite:'dinh',text:'Ngôi nhà chung của làng Việt, nơi thờ thành hoàng làng và là chỗ dân làng họp bàn việc chung, mở hội.'},
  {id:'conglang',group:'Địa danh',title:'Cổng làng',sprite:'conglang',text:'Cổng dựng ở đầu làng Bắc Bộ, như một cánh cửa chào khách và gìn giữ bình yên cho làng.'},
  {id:'gieng',group:'Địa danh',title:'Giếng làng',sprite:'gieng',text:'Giếng nước chung của cả xóm, nơi mọi người gánh nước, rửa rau và trò chuyện.'},
  {id:'quan',group:'Địa danh',title:'Quán trà đá',sprite:'quan',text:'Quán nước bên đường với ấm trà, ly trà đá và vài chiếc ghế thấp, nơi người qua đường dừng chân nghỉ.'},
  {id:'xebanhmi',group:'Địa danh',title:'Xe bánh mì',sprite:'xebanhmi',text:'Chiếc xe đẩy bán bánh mì nóng giòn trên phố, một hình ảnh quen thuộc của bữa sáng người Việt.'},
  {id:'da',group:'Địa danh',title:'Cây đa',sprite:'da',text:'Cây đa cổ thụ đầu làng toả bóng mát rộng, nơi trẻ con nô đùa và người lớn hóng gió.'},
  {id:'nharong',group:'Địa danh',title:'Nhà rông',sprite:'nharong',text:'Ngôi nhà chung mái cao vút của buôn làng một số dân tộc Tây Nguyên, nơi tổ chức lễ hội và họp việc làng.'},
  {id:'congchieng',group:'Địa danh',title:'Cồng chiêng',sprite:'congchieng',text:'Cồng chiêng là nhạc cụ bằng đồng của các dân tộc Tây Nguyên. Không gian văn hoá cồng chiêng Tây Nguyên được UNESCO ghi danh.'},
  {id:'thapcham',group:'Địa danh',title:'Tháp Chàm',sprite:'thapcham',text:'Những ngọn tháp gạch đỏ do người Chăm xây từ nhiều thế kỷ trước ở miền Trung, vẫn đứng vững đến ngày nay.'},
  {id:'thuyenthung',group:'Địa danh',title:'Thuyền thúng',sprite:'thuyenthung',text:'Chiếc thuyền tròn đan bằng tre, trét nhựa, thường thấy ở vùng biển miền Trung, dùng để đánh cá gần bờ.'},
  {id:'caooc',group:'Địa danh',title:'Cao ốc Sài Gòn',sprite:'caooc',text:'Những toà nhà cao tầng của Thành phố Hồ Chí Minh, thành phố đông dân và nhộn nhịp bậc nhất cả nước.'},
  {id:'hutieu',group:'Địa danh',title:'Xe hủ tiếu gõ',sprite:'xehutieu',text:'Xe hủ tiếu rong gõ lốc cốc rao hàng ở các xóm miền Nam. Hủ tiếu là món ăn quen thuộc của người Nam Bộ.'},
  {id:'caosu',group:'Địa danh',title:'Rừng cao su',sprite:'cay_caosu',text:'Những hàng cây cao su thẳng tắp ở Đông Nam Bộ và Tây Nguyên, được trồng để lấy mủ.'},
  {id:'caphe_ray',group:'Địa danh',title:'Rẫy cà phê',sprite:'ray_caphe',text:'Vùng đất đỏ Tây Nguyên trồng rất nhiều cà phê. Việt Nam là một trong những nước xuất khẩu cà phê lớn trên thế giới.'},
  {id:'nhasan',group:'Địa danh',title:'Nhà sàn',sprite:'nhasan',text:'Nhà dựng trên cột cao của nhiều dân tộc miền núi, tránh ẩm và thú dữ, phần gầm sàn để chứa đồ và nuôi gia súc.'},
  {id:'nhapho',group:'Địa danh',title:'Nhà phố Hội An',sprite:'nhapho',text:'Những dãy nhà phố mái ngói, tường vàng treo đèn lồng ở Hội An. Phố cổ Hội An là di sản văn hoá thế giới.'},
  {id:'chonoi',group:'Địa danh',title:'Chợ nổi',sprite:'ghe',text:'Chợ họp ngay trên sông ở miền Tây, ghe xuồng buôn bán trái cây, rau củ và treo hàng lên cây sào để khách nhìn thấy.'},
  {id:'miet_vuon',group:'Địa danh',title:'Vườn trái cây',sprite:'cayxoai',text:'Miệt vườn là vùng vườn cây trái xum xuê của miền Tây, quanh năm có trái chín: xoài, chôm chôm, bưởi.'},
  {id:'bunhin',group:'Địa danh',title:'Bù nhìn',sprite:'bunhin',text:'Hình nhân dựng giữa đồng để doạ chim đến ăn lúa, làm bằng rơm, nón và quần áo cũ.'},
  {id:'rom',group:'Địa danh',title:'Đống rơm',sprite:'rom',text:'Rơm phơi khô sau mùa gặt, được chất thành đống ở sân hay bờ ruộng để làm chất đốt và thức ăn cho trâu bò.'},
  /* Món ăn */
  {id:'f_banhmi',group:'Món ăn',title:'Bánh mì',sprite:'banhmi',text:'Ổ bánh mì giòn kẹp thịt, pa tê, rau và đồ chua, món ăn đường phố nổi tiếng của người Việt.'},
  {id:'f_pho',group:'Món ăn',title:'Phở',sprite:'pho',text:'Bát bánh phở với nước dùng thơm ninh từ xương, ăn kèm thịt bò hoặc gà và rau thơm.'},
  {id:'f_caphe',group:'Món ăn',title:'Cà phê',sprite:'caphe',text:'Cà phê pha phin nhỏ giọt chậm, uống với sữa đặc hoặc để đen, một thói quen của người Việt.'},
  {id:'f_banhchung',group:'Món ăn',title:'Bánh chưng',sprite:'banhchung',text:'Bánh vuông gói lá dong với nếp, đậu xanh và thịt, nấu thật lâu. Món bánh không thể thiếu ngày Tết cổ truyền.'},
  {id:'f_miquang',group:'Món ăn',title:'Mì Quảng',sprite:'miquang',text:'Món mì đặc trưng của xứ Quảng, sợi mì to dẹt, ít nước, ăn cùng rau sống và bánh tráng nướng.'},
  {id:'f_comlam',group:'Món ăn',title:'Cơm lam',sprite:'comlam',text:'Gạo nếp nấu trong ống tre nứa nướng trên than, một món ăn của các dân tộc vùng núi.'},
  {id:'f_hutieu',group:'Món ăn',title:'Hủ tiếu',sprite:'hutieu',text:'Món sợi gạo nước trong ngọt, ăn với thịt, tôm và rau, rất phổ biến ở miền Nam.'},
  {id:'f_banhxeo',group:'Món ăn',title:'Bánh xèo',sprite:'banhxeo',text:'Chiếc bánh bột gạo vàng giòn nhân tôm thịt, ăn cuốn với rau sống và chấm nước mắm chua ngọt. Tên bánh gợi tiếng xèo xèo khi đổ bột vào chảo.'},
  {id:'f_xoi',group:'Món ăn',title:'Xôi',sprite:'xoi',text:'Gạo nếp đồ chín, có xôi đậu, xôi gấc, xôi ngũ sắc, là món ăn sáng, món cúng và món mừng quen thuộc.'},
  /* Con vật */
  {id:'a_trau',group:'Con vật',title:'Trâu',sprite:'trau',text:'Con trâu gắn bó với người nông dân trồng lúa nước, kéo cày và là hình ảnh thân thuộc của làng quê Việt Nam.'},
  {id:'a_co',group:'Con vật',title:'Cò',sprite:'co',text:'Cò trắng sải cánh trên đồng lúa, xuất hiện nhiều trong ca dao và tranh dân gian.'},
  {id:'a_ga',group:'Con vật',title:'Gà',sprite:'ga',text:'Gà nuôi thả vườn khắp các làng quê, tiếng gáy sáng là chiếc đồng hồ báo thức của xóm.'},
  {id:'a_voi',group:'Con vật',title:'Voi',sprite:'voi',text:'Voi nhà gắn bó với người dân vùng Tây Nguyên, nhất là ở Đắk Lắk.'},
  {id:'a_vit',group:'Con vật',title:'Vịt',sprite:'vit',text:'Đàn vịt bơi trên ao hồ, kênh rạch và đồng ruộng, được nuôi nhiều ở vùng đồng bằng.'},
  /* Ban đêm */
  {id:'n_domdom',group:'Ban đêm',title:'Đom đóm',sprite:'denlong_on',text:'Những đốm sáng nhỏ nhấp nháy trong đêm hè ở miền quê, mong manh như ký ức tuổi thơ.'},
  {id:'n_chodem',group:'Ban đêm',title:'Chợ đêm',sprite:'denlong_on',text:'Chợ họp về đêm với đèn lồng và quầy hàng nhỏ, nơi người dân và khách thưởng thức món ăn đường phố.'},
  {id:'q_1',group:'Hành trình',title:'Việc vặt đầu tiên',sprite:'quan',text:'Giúp người ta một việc nhỏ dọc đường. Đi xa rồi mới thấy, chuyến đi vui hơn khi có người nhờ cậy.'},
  {id:'q_5',group:'Hành trình',title:'Người quen của xóm',sprite:'chum',text:'Năm việc vặt đã xong. Bà con bắt đầu nhớ mặt lữ khách đội nón lá.'},
  {id:'q_15',group:'Hành trình',title:'Chân chạy việc làng',sprite:'conglang',text:'Mười lăm việc vặt. Tới đâu cũng có người gọi vào uống chén trà.'},
  {id:'p_1',group:'Hành trình',title:'Tấm bưu thiếp đầu tiên',sprite:'k_idle',text:'Chụp một tấm làm kỷ niệm, gửi về cho người ở nhà.'}
];
const STAMP_BY_ID={};STAMPS.forEach(s=>STAMP_BY_ID[s.id]=s);
