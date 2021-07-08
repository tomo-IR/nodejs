const base_url = "https://app.rakuten.co.jp/services/api/Gora/GoraGolfCourseSearch/20170623?format=json";
const apiKey = "1083401508369226218";
var global_areacode = "";
var global_keyword = "";
var global_url = base_url + "&applicationId=" + apiKey;
var global_golfcourse_json;

var areacode_object = new Vue({
    el: "#address",
    data: {
        options: [
            { id: 101, name: '北海道、東北のすべて' },
            { id: 102, name: '関東のすべて' },
            { id: 103, name: '北陸のすべて' },
            { id: 104, name: '中部のすべて' },
            { id: 105, name: '近畿のすべて' },
            { id: 106, name: '中国のすべて' },
            { id: 107, name: '四国のすべて' },
            { id: 108, name: '九州・沖縄のすべて' },
            { id: 109, name: '海外' },
            { id: 1, name: '北海道' },
            { id: 2, name: '青森県' },
            { id: 3, name: '岩手県' },
            { id: 4, name: '宮城県' },
            { id: 5, name: '秋田県' },
            { id: 6, name: '山形県' },
            { id: 7, name: '福島県' },
            { id: 8, name: '茨城県' },
            { id: 9, name: '栃木県' },
            { id: 10, name: '群馬県' },
            { id: 11, name: '埼玉県' },
            { id: 12, name: '千葉県' },
            { id: 13, name: '東京都' },
            { id: 14, name: '神奈川県' },
            { id: 15, name: '新潟県' },
            { id: 16, name: '富山県' },
            { id: 17, name: '石川県' },
            { id: 18, name: '福井県' },
            { id: 19, name: '山梨県' },
            { id: 20, name: '長野県' },
            { id: 21, name: '岐阜県' },
            { id: 22, name: '静岡県' },
            { id: 23, name: '愛知県' },
            { id: 24, name: '三重県' },
            { id: 25, name: '滋賀県' },
            { id: 26, name: '京都府' },
            { id: 27, name: '大阪府' },
            { id: 28, name: '兵庫県' },
            { id: 29, name: '奈良県' },
            { id: 30, name: '和歌山県' },
            { id: 31, name: '鳥取県' },
            { id: 32, name: '島根県' },
            { id: 33, name: '岡山県' },
            { id: 34, name: '広島県' },
            { id: 35, name: '山口県' },
            { id: 36, name: '徳島県' },
            { id: 37, name: '香川県' },
            { id: 38, name: '愛媛県' },
            { id: 39, name: '高知県' },
            { id: 40, name: '福岡県' },
            { id: 41, name: '佐賀県' },
            { id: 42, name: '長崎県' },
            { id: 43, name: '熊本県' },
            { id: 44, name: '大分県' },
            { id: 45, name: '宮崎県' },
            { id: 46, name: '鹿児島県' },
            { id: 47, name: '沖縄県' }
        ]
    }
});


var f_areacode = document.getElementById('address');
f_areacode.addEventListener('change', inputChange);

var keyword = new Vue({
    el: '#form_input',
    methods: {
        onInput_keyword: async function() {
            global_keyword = document.getElementById('search_keyword').value;
            var function_keyword = "&keyword=" + global_keyword;
            var keyword_url = global_url + "&areaCode=" + global_areacode + function_keyword;
            var res = await fetch(keyword_url);
            var golfcourse_json = await res.json();
            global_golfcourse_json = golfcourse_json;

            hit_zero();
            console.log("保持したいキーワードは" + global_keyword);
            console.log("初期化前のglobal_urlは" + global_url);
            console.log(keyword_url);
            console.log(golfcourse_json);
            console.log(golfcourse_json.count);
            console.log(golfcourse_json.pageCount);
            console.log(golfcourse_json.Items[0].Item.golfCourseName);
            document.getElementById('api_output').innerHTML = golfcourse_json.count;
            list_delete();
            get_list();
        }
    }
});

async function inputChange(event) {
    global_areacode = event.currentTarget.value;
    var function_areacode = "&areaCode=" + global_areacode;
    var areacode_url = global_url + "&keyword=" + global_keyword + function_areacode;
    var res = await fetch(areacode_url);
    var golfcourse_json = await res.json();
    global_golfcourse_json = golfcourse_json;

    hit_zero();

    console.log(global_areacode);
    console.log(global_url);
    console.log(golfcourse_json);
    console.log(golfcourse_json.count);
    console.log(golfcourse_json.pageCount);
    console.log(golfcourse_json.Items[1].Item.golfCourseName);
    document.getElementById('api_output').innerHTML = golfcourse_json.count;

    console.log("保持されたキーワードは" + global_keyword);
    console.log("保持されたエリアコードは" + global_areacode);
    list_delete();
    get_list();
}

function list_delete() {
    while (search_result.firstChild) {
        search_result.removeChild(search_result.firstChild);
    }
    console.log("リストデリート完了");
}

function get_list() {
    for (let i = 0; i < global_golfcourse_json.hits; i++) {
        console.log(i);
        console.log(global_golfcourse_json.Items[i].Item.golfCourseName);

        document.getElementById('search_result');
        var newElement = document.createElement("li"); // p要素作成
        var newContent = document.createTextNode(global_golfcourse_json.Items[i].Item.golfCourseName); // テキストノードを作成
        newElement.appendChild(newContent); // p要素にテキストノードを追加
        newElement.setAttribute("id", "list_" + i); // p要素にidを設定

        var parentDiv = document.getElementById("search_result");
        parentDiv.appendChild(newElement, parentDiv.firstChild);
    }

}

function hit_zero() {
    if (global_golfcourse_json.error == "not_found") {
        console.log("該当無し");
        console.log("エラーの表示は" + global_golfcourse_json.error);
        document.getElementById('api_output').innerHTML = 0;
        list_delete();
    } else {
        console.log(" 該当あり");
    }
}