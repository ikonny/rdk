﻿
<rdk_title>后端服务API</rdk_title>

## rdk rest 服务请求说明 ##

可以方便的向rdk发起请求。

[查看rest请求说明](rdk_rest_service.md)

## 集合/数组/对象的常用功能集 ##

系统引入了underscore这个开源库，可以直接使用这个库的相应函数。

[查看underscore使用API](underscore_doc_v1_7_0.html)

## 文件操作 {#file_oper} ##

[查看文件操作API](service_file_api.md)

## 公共导出服务 ##

[查看公共导出服务](/doc/client/common/export.md)

## 消息队列 ##

- [查看消息队列API -- JS](service_mq_js_api.md)
- [查看消息队列API -- JAVA](service_mq_java_api.md)
- [其他手册](ActiveMQ_menual.chm)

## API

### 日志 ###

RDK提供了一组记录日志的函数，它们有共同的定义：
	
	function log(msg1, msg2, msg3, ...);

参数：

- `msg1`, `msg2`, ... 任意对象。可选。RDK会尝试将这些对象转为字符串写入日志中，目前完美支持Date，任意结构的json对象。对其他复杂对象支持不好，不支持Java对象。

一共有这些（日志级别由低到高）：

- `log()` / `Log.debug()`：记录debug级别的日志
- `Log.info()`：记录info级别的日志
- `Log.warn()`：记录warn级别的日志
- `Log.error()`：记录error级别的日志
- `Log.fatal()`：记录fatal级别的日志
- `Log.crit()`：记录一些关键日志，级别最高

   RDK日志分为总的日志和应用日志，默认生成总的日志，日志路径为proc/log目录下

   **应用若要生成自己的日志文件需要配置proc/conf/log4j.propertites文件**。

该文件中已经配置好了总的日志，控制台日志以及example应用日志，用户只需要参照example日志进行配置即可。

简便可靠的做法是复制example配置部分，在此基础上进行修改。

示例：应用‘用户查询’位置为app/sqm/query_server/userQuery

要生成该应用的日志需要在log4j.propertites文件中添加配置：

    log4j.logger.sqm/query_server/userQuery=DEBUG,sqm/query_server/userQuery
    log4j.appender.sqm/query_server/userQuery=org.apache.log4j.RollingFileAppender
    log4j.appender.sqm/query_server/userQuery.File=./proc/logs/userQuery_log.txt
    log4j.appender.sqm/query_server/userQuery.Threshold=DEBUG
    log4j.appender.sqm/query_server/userQuery.Append=true
    log4j.appender.sqm/query_server/userQuery.MaxFileSize=10MB
    log4j.appender.sqm/query_server/userQuery.MaxBackupIndex=10
    log4j.appender.sqm/query_server/userQuery.layout=org.apache.log4j.PatternLayout
    log4j.appender.sqm/query_server/userQuery.layout.ConversionPattern=%d %p [%c] - %m%n
    log4j.additivity.sqm/query_server/userQuery=true


文件配置后无需重启rdk服务，30秒后自动生效。

### 操作日志 ###

rdk为应用提供可扩展的日志上报功能。

定义：

	function Log.operateLog(userOpInfo,operateLogScript); 
	
参数：

- userOpInfo 一个js对象。必选。它具体的数据结构，由实现写操作日志的脚本决定。
- operateLogScript 字符串。可选。自定义操作日志服务文件位置。	 

返回：true/false。

说明：operateLogScript不设置时，rdk将自动调用默认的应用配置Vmax操作日志脚本，配置路径位于**proc/conf/rdk.cfg**，用户需配置**extension.operateLog** 属性以告知rdk应用操作日志服务所在位置，应用可按自己的业务来实现日志上报，具体可参考[Vmax操作日志的实现](vmaxOperateLog.js)。

示例：

用户想要调用Vmax操作日志服务，并按自己要求填写“descinfo”的详细信息。

1、放开proc/conf/rdk.cfg extension.operateLog属性配置（默认属性值为app/common/vmaxOperateLog.js）

2、下载[Vmax操作日志的实现](vmaxOperateLog.js)，并将该文件放置于app/common目录下

3、调用服务：

    Log.operateLog({"descinfo":"查询表dim_ne"})

### `Mapper` ###

实际开发中，常常需要定义一个可根据给定的属性来从一个映射中获取其对应的值的处理函数，Mapper变量提供了简便的处理方法。

#### `Mapper.fromObject()` ####

该函数可以构造一个基于js对象完成映射获取的处理函数。

定义：

	function fromObject(jsObject, defaultValue);

参数：

- jsObject 一个JS对象。必选。
- defaultValue 一个整数/字符串/布尔。可选，默认值是key本身，即默认返回key值。

返回：一个**转换函数**，这个转换函数的作用是返回某个值在入参 `jsObject` 中的映射。

说明：常常用于对数据集中的某列做国际化。

示例：某个表中有一个字段用于表示“是否”这样的状态，存在库中，1代表“是”，0代表“否”，可以使用下面的代码得到一个转换函数：

	var tranformFunction = Mapper.fromObject({1: "是", 0: "否"});

	var val = tranformFunction(0); // "否"
	var val = tranformFunction(1); // "是"
	var val = tranformFunction(2); // 2

如果期望在输入非1、0时得到“未知”，则可以使用下面代码

	var tranformFunction = Mapper.fromObject({1: "是", 0: "否"}， "未知");
	var val = tranformFunction(2); // "未知"

#### `Mapper.fromSql()` ####

该函数可以构造一个基于sql查询数据库并完成映射获取的处理函数。

定义：

	function fromSql(sql, keyField, valueField, defaultValue);

参数：

- sql 一个用来查询数据库的sql串。必选。
- keyField 一个字符串，必选，对应构造映射键的列名。
- valueField 一个字符串，必选，对应构造映射值的列名。
- defaultValue 一个整数/字符串/布尔。可选，默认值是key本身，即默认返回key值。

返回：一个**转换函数**，这个转换函数的作用是返回某个值在根据前三个参数构造而成的jsObject中的映射。

示例：假设需要查询数据库，根据dim_ne表的neid,name列生成一组映射，并根据此映射来构造一个转换函数以便给定一个neid值时方便的得到其对应的name值：

	  var tranformFunction = Mapper.fromSql("select * from dim_ne;",'neid','name',"unknown");
      tranformFunction("30");//表dim_ne中neid=30对应的name值
      
说明：**注意，该函数只限制查询20000条记录，若应用需要更大数量的查询，可将[fetch函数](#fetch)和[Mapper.fromDataTable 函数](#fromDataTable)结合使用：**

      var regionData = Data.fetch("select distinct region_id,region from ts_cell", 300000);//先调用fetch函数并设置你想要的查询最大记录数
      Mapper.fromDataTable(regionData, 'region_id', 'region'); //再调用Mapper.fromDataTable 函数即可                          

#### `Mapper.fromDataTable()` {#fromDataTable} ####


该函数可以构造一个基于[DataTable](#dataTable)并完成映射获取的处理函数。

定义：

	function fromDataTable(dataTable, keyField, valueField, defaultValue);

参数：

- dataTable 一个[DataTable](#dataTable)对象。必选。
- keyField 一个字符串，必选，对应构造映射键的列名。
- valueField 一个字符串，必选，对应构造映射值的列名。
- defaultValue 一个整数/字符串/布尔。可选，默认值是key本身，即默认返回key值。

返回：一个**转换函数**，这个转换函数的作用是返回某个值在根据前三个参数构造而成的jsObject中的映射。

示例：假设需要查询数据库，根据dim_ne表的neid,name列生成一组映射，并根据此映射来构造一个转换函数以便给定一个neid值时方便的得到其对应的name值：

      var dataTable=Data.fetch("select * from dim_ne;")
	  var tranformFunction = Mapper.fromDataTable(dataTable,'neid','name',"unknown");
      tranformFunction("30");//表dim_ne中neid=30对应的name值


### `DataTable对象` {#dataTable}

DataTable构造函数生成一个矩阵对象，同时提供了在该对象上一系列方便的函数操作，同时这些操作本身仍返回该对象本身，因此可实现链式调用。

#### 数据矩阵（matrix）的数据结构

DataTable对象的数据矩阵的结构如下，这是数据矩阵最基本的结构：

	{
		header: ['header1', 'header2', 'header3'],
		field: ['field1', 'field2', 'field3'],
		data: [
				['data11', 'data12', 'data13'],
				['data21', 'data22', 'data23'],
				...
				['data31', 'data32', 'data33']
			]
	}

header和field都是一维数组，data是一个二维数组。data的值对应着数据库表的数据，field是data中每一列对应的列头，header是field每个元素对应的国际化。

#### `DataTable.transform()` ####

该函数提供了可以对DataTable数据列进行数据转换的简便处理方法。

定义：
  
     function transform(transObjectConf)

参数：

- transObjectConf：一个js对象，对象属性名为要转换的列名，属性值为对该列进行转换操作的函数，可支持对多列进行处理，只需要定义多个属性及其对应的映射即可。

返回：
   
  转换过后的DataTable对象

说明：
  **操作会修改原始对象的值，若希望保留原对象值，可先调用[clone()](#clone)方法**

例子：


	(function() {
		
		return function(request) {
		
			var mapIter = {
				//使用Mapper.fromSql函数创建一个通用的国际化迭代函数
				neid: Mapper.fromSql("select neid,name from dim_ne",'neid', 'name'),
	
				//根据自定义算法算出 kpi_succ_rate 的值。可根据第二个参数row获取辅助行数据数组，根据第三个参数field获取辅助字段数组。
				kpi_succ_rate: function(value,row,field) {
					...
				}
			}
			
			//查询出基础数据集
			var sql = 'select neid,"" as kpi_succ_rate,succ_counter,all_counter from aggr_xxxx where ...';
			var result = Data.fetch(sql).transform(mapIter);
			return result;
		}
	})();


这个服务返回了类似下面这样的数据给前端：

	{
		header: ['neid', 'kpi_succ_rate', 'succ_counter','all_counter'],
		field: ['neid', 'kpi_succ_rate', 'succ_counter','all_counter'],
		data: [
				['S1MME_1', '98.99', '9899', '10000'],
				['S1U_1_DPI', '97.44', '9744', '10000'],
				...
				['S11_1', '99.44', '9944', '10000']
			]
	}


#### `DataTable.select()` ####

该函数可以根据给定的列名对[DataTable](#dataTable)进行选取。

定义：
  
      function select(colNameArray)

参数：

- colNameArray：一个js数组，即要选取的列的field名称。

返回：
   
  筛选列过后的DataTable对象

说明：
 **操作会修改原始对象的值，若希望保留原对象值，可先调用[clone()](#clone)方法**

示例：
  
      var tabledata=Data.fetch("select neid,name from dim_ne",4000);
      //假设返回的数据结构为 {
      //                    header:['neid','name'],
      //                    field:['neid','name'],
      //                    data:[['30','test1'],['20','test2']]
      //                   }
      
       tabledata.select(['name']);
      // 则返回的数据结构为 {
      //                    header:['name'],
      //                    field:['name'],
      //                    data:[['test1'],['test2']]
      //                }


#### `DataTable.clone()`{#clone}  

定义：
  
      function clone()

参数：

- 无

返回：
   
  一个新的DataTable对象


### `Data对象` ###

该对象提供了一些和数据库操作有关的方法，比如增删改查功能。


#### `Data.setDataSource()`{#setDataSource} ####

用于动态设置数据源配置信息接口。

定义：
  
    function setDataSource(jsObject);

参数：

 - jsObject：js对象，结构和`datasource.cfg`里的配置一致。

返回：
 
 undefined

示例：要动态修改datasource.cfg里mysql_test数据库url配置为10.43.149.223数据库，其他不变。

		Data.setDataSource({"db":{"mysql_test":{"url":"jdbc:gbase://10.43.149.223:5258/zxvmax?user=zxvmax&password=ZXvmax2016&failoverEnable=false&hostList=10.43.149.223"}}})


#### `Data.setDataSourceSelector()`{#setDataSourceSelector} ####

多数据源场景，可使用该函数可用来设置你自定义的数据源选择器,默认使用gbase数据库作为rdk查询对象。

定义：
  
    function setDataSourceSelector(selector);

参数：

 - selector：一个自定义的函数闭包，该函数用来定义你选择数据源的业务逻辑。

返回：
 
 undefined



#### `Data.useDataSource()`{#useDataSource} ####

多数据源场景，该函数用来选择使用的数据源

定义：

    function useDataSource();

参数：无

返回：undefined


#### rdk多数据源使用示例 {#mulit-ds-example}
第一步，在**proc\bin\lib\jdbc**目录下放置应用所需数据库jdbc驱动包，rdk默认已经提供gbase和mysql的驱动包。

第二步，配置应用需要的数据源信息，包括数据库连接信息以及对应的连接池信息，配置文件位于 **proc/conf/datasource.cfg**，以下示例配置了mysql和hbase的数据库以及各自连接池信息

  	数据库连接配置：
    
      db{
           mysql{
			    #驱动(必选)
			   driver=com.mysql.jdbc.Driver
			   #jdbc url(必选)
			   url="jdbc:mysql://10.43.149.231:3306/dap_model?user=root&password=U_tywg_2013&useUnicode=true&characterEncoding=UTF8"
			   #引用连接池(必选)
			   poolRef=pool.default  //对应以下连接配置，连接池按default配置项进行配置
		   }
		 
		   hbase{
			    #驱动(必选)
			   driver=***   
			   #jdbc url(必选)
			   url="jdbc:***" 
			   #引用连接池(必选)，连接池定义见上节pool
			   poolRef=pool.hbasePool
		  }
	    }

   	连接池配置：

		pool{
		    #默认连接池配置(保留)
		    default{
		        #获取连接最大等待时长（ms）
		        maxWait=6000
		        #设置数据库初始化时，创建的连接个数
		        initialSize=10
		        #最大活跃连接数
		        maxTotal=128
		        #设置最小空闲连接数
		        minIdle=10
		        #设置最大空闲连接数
		        maxIdle=50
		        #设置空闲连接多长时间后释放(单位ms)
		        minEvictableIdleTimeMillis=15000
		        #自动回收泄露连接时长(单位s)
		        removeAbandonedTimeout=300
		        #设置在获取连接的时候检查有效性, 默认true
		        testOnBorrow=true
		    }
		    hbasePool{
		        #获取连接最大等待时长（ms）
		        maxWait=6000
		        #设置数据库初始化时，创建的连接个数
		        initialSize=1
		        #最大活跃连接数
		        maxTotal=20
		        #设置最小空闲连接数
		        minIdle=1
		        #设置最大空闲连接数
		        maxIdle=5
		        #设置空闲连接多长时间后释放(单位ms)
		        minEvictableIdleTimeMillis=15000
		        #自动回收泄露连接时长(单位s)
		        removeAbandonedTimeout=300
		        #设置在获取连接的时候检查有效性, 默认true
		        testOnBorrow=true
		    }
		
		}

第三步，在应用[init.js](#init)文件调用[Data.setDataSourceSelector](#setDataSourceSelector)方法设置数据源选择器。以下示例描述的是，当使用[Data.useDataSource()](#useDataSource)选择“mysql”时则返回db.mysql即第二步中配置的mysql数据库，选择“hbase”时则
返回db.hbase即第二步中配置的hbase数据库，其他情况则选择rdk的默认使用数据库gbase

		(function () {
		    function selectDataSource(params){
		        var database = params[0]   //注意，param为函数argument数组
		        switch (database){
		            case "mysql":
		                return "db.mysql"
		            case "hbase":
		                return "db.hbase"
		            default:
		                return "db.default"
		        }
		    }
		
		    function _init_() {
		        Data.setDataSourceSelector(selectDataSource);
					....
		    }
		    return {
		        init: _init_
		    }
		})();

第四步，重启rdk_server，**注意：增加新的数据库驱动及对应配置，以及init.js内容发生变更，需要重启rdk\_server才能生效**

第五步，使用[Data.useDataSource()](#useDataSource)选择当前使用的数据源。
     
   		Data.useDataSource("mysql");					
        log(Data.fetch("SELECT * FROM dim_ne",5000)); //查询mysql数据库
        Data.useDataSource("hbase");                   
        log(Data.fetch("SELECT * FROM dim_ne",5000)); //查询hbase数据库

#### `Data.allowNullToString()` {#allowNullToString} ####

该函数提供了一个开关，以控制[Data.fetch](#fetch)和[Data.fetchWithDataSource](#fetchWithDataSource)对空数据的处理。

定义：
   
    function allowNullToString(allow);

参数：

- allow: 布尔类型，true/false
    - 设为ture或者不调用，则fetch返回遇到空值则将其转为**字符串** `"null"`
    - 设为false，则fetch返回为js null对象

返回：

 undefined

说明：

可以在应用的init.js中调用此函数以统一控制。     
   		
#### `Data.fetch()` {#fetch} ####

该函数提供了简便的可查询数据库数据的方法。

定义：

    function fetch(sql,maxLine);

说明：执行数据库查询功能。

参数：

- sql: 一个SQL字符串，必选。

- maxLine:查询数据返回的最大记录数，数值型，可选，默认为4000。

返回：

 [DataTable对象](#dataTable)


说明：异常时返回{"error":""}对象，属性error里包含具体的错误信息。


 #### `Data.fetchWithDataSource()` {#fetchWithDataSource} ####

该函数提供了根据自定义数据源查询数据库数据的安全方法。

定义：

    function fetchWithDataSource(dataSource,sql,maxLine);

参数：

- dataSource：数据源标识字符串，必选，** 注意，该标识对应于`proc/conf/datasource.cfg`文件中真实数据标记（以db.开头）**

- sql: 一个SQL字符串，必选。

- maxLine:查询数据返回的最大记录数，数值型，可选，默认为4000。

返回：

 [DataTable对象](#dataTable)


说明：异常时返回{"error":""}对象，属性error里包含具体的错误信息。 

示例：查询`proc/conf/datasource.cfg`文件中db目录下mysql标记对应的数据库

        Data.fetchWithDataSource("db.mysql","select * from dim_ne where neid =10"); 
                          

#### `Data.fetchFirstCell()` ####

该函数返回查询数据的第一行第一列。

定义：

    function fetchFirstCell(sql);

参数：

- sql: 一个SQL字符串，必选。

返回：
 
  数据的第一行第一列，字符串类型

说明：空数据返回js null对象  


#### `Data.batchFetch()` ####

该函数提供了并发查询数据库的功能。

定义：

    function batchFetch(sqlArray, maxLine,timeout);

说明：并发执行多个sql的查询并返回结果，超时后抛出超时异常。

参数：

- sqlArray: 一个SQL字符串数组，必选。

- maxLine：返回的最大记录数，可选，默认为4000。

- timeout ：批量查询超时时间，单位秒，可选，默认为30。


返回：
 
  [DataTable对象](#dataTable)数组


说明：若其中某个sql执行异常则，则返回数组对应的该异常sql会返回{"error":""}对象，属性error里包含此sql具体的错误信息。  

示例：

    Data.batchFetch(['select * from dim_ne;','select * from dim_comm_city'],4000,10);


#### `Data.batchFetchWithDataSource()` ####

该函数提供了根据数据源标识并发查询数据库的安全方法。

定义：

    function batchFetchWithDataSource(dataSource, sqlArray, maxLine, timeout);

参数：

- dataSource：数据源标识字符串，必选，** 注意，该标识对应于`proc/conf/datasource.cfg`文件中真实数据标记（以db.开头）**

- sqlArray: 一个SQL字符串数组，必选。

- maxLine：返回的最大记录数，可选，默认为4000。

- timeout ：批量查询超时时间，单位秒，可选，默认为30。

返回：
 
  [DataTable对象](#dataTable)数组


说明：若其中某个sql执行异常则，则返回数组对应的该异常sql会返回{"error":""}对象，属性error里包含此sql具体的错误信息。    

示例：

并发查询`proc/conf/datasource.cfg`文件中db目录下mysql标记对应的数据库表：
     	
        Data.batchFetchWithDataSource("mysql",['select * from dim_ne;','select * from dim_comm_city']); //查询mysql数据库

#### `Data.update()` ####

该函数提供了可并发完成数据库增删改功能。

定义：

    function update(sql);

执行数据库增删改功能

参数：

 - sql:一个sql字符串或者一个sql字符串数组，必选。其中对sql数组的执行时并发的。


返回：
 
   参数为一个sql字符串时，函数返回该sql执行返回的受影响记录数对应的字符串；
   参数为sql数组时，函数返回该sql数组分别执行返回的受影响记录数对应的字符串数组。

 
说明：无论入参是单个sql还是sql数组，sql执行错误时会返回 {"error":""}对象，属性error里包第一个出错sql的具体信息，此过程是事务处理过程，只要出错就会回滚事务。


### `require() ` ###

定义：

	function require(script);

参数：

- script 一个字符串。待加载的脚本url，可使用[路径宏](relative_path_rule.md)简化路径。

返回：对应脚本的运行结果。

说明：可以使用 `require()` 来引入其他的js文件。目标脚本被加载之后会立即运行该脚本，如果有返回值，则通过 `require()` 的返回值来引用。比如某服务有一个公共函数库mylib.js，代码为：

	(function() {
		return {
			hello: function(name) {
				log('hello ' + name);
			}
		}
	})();

则可以这样来引用它

	var lib = require('mylib.js');
	lib.hello('rdk');


### `Rest` ###
#### `Rest.get()` {#Rest_get} ####

定义：

	function get(url, param, option, needErrorInfo); 

说明：在后端代码中调用其他的rest服务并返回其应答数据。

参数：

- url: 目标服务的url。
- param: 传递给rest服务的参数
- option: 本次请求的参数
- needErrorInfo:可选，布尔型。控制请求异常时返回异常对象(格式：{"rdkRestError":""})还是null,未设置则返回null。

说明：

原api接口 `Rest.get(url, option)` 被保留，但是不推荐继续使用。

option的结构如下：

	{
		// 对应http请求头中的requestProperty字段，
		// 此对象中的所有属性都会被拷贝到http请求的RequestProperty中去
		requestProperty: {
			content-type: 'application/json'
		},
		connectTimeout: 60000,
		readTimeout: 20000,

		//如果为true则系统不会自动为这个url做编码，默认值是false
		//在hasEncoded==false时，传递复杂结构参数，RDK会对 `encodeURI()`
		//无法编码到的字符进行编码编码，这些字符有 # & ' + =
		hasEncoded: true
	}

返回：该服务的返回值。


#### `Rest.put()` ####

定义：

    function put(url, param, option, needErrorInfo);

说明：在后端代码中调用其他的put服务并返回其应答数据。

参数：

- url: 目标服务的url，必选。
- param: 目标服务的请求参数字符串或者json对象，可选。
- option: 本次请求的参数，同get参数option，可选。
- needErrorInfo:可选，布尔型。控制请求异常时返回异常对象(格式：{"rdkRestError":""})还是null,未设置则返回null。

返回：该服务的返回值。    

#### `Rest.post()` ####

定义：

    function post(url, param, option, needErrorInfo);

说明：在后端代码中调用其他的post服务并返回其应答数据。

参数：

- url: 目标服务的url，必选。
- param: 目标服务的请求参数字符串或者json对象，可选。
- option: 本次请求的参数，同get参数option，可选。
- needErrorInfo:可选，布尔型。控制请求异常时返回异常对象(格式：{"rdkRestError":""})还是null,未设置则返回null。

返回：该服务的返回值。

#### `Rest.delete()` ####

定义：

    function delete(url, param, option, needErrorInfo);

说明：在后端代码中调用其他的delete服务并返回其应答数据。

参数：

- url: 目标服务的url，必选。
- param: 目标服务的请求参数字符串或者json对象，可选。
- option: 本次请求的参数，同get参数option，可选。
- needErrorInfo:可选，布尔型。控制请求异常时返回异常对象(格式：{"rdkRestError":""})还是null,未设置则返回null。

返回：该服务的返回值。

#### `Rest.encodeURIExt()` ####

定义：

    function encodeURIExt(uri);

说明：扩展了原声encodeURI()函数的功能，加入了这几个字符的编码 `# & ' + =`

参数：

- uri: 待编码的uri，必选。

返回：编码后的uri。

### `Cache` ###

该对象提供了一些缓存相关的方法。

#### `Cache.put()` ####

定义：

    function put(k, v);

说明：将数据保存至该应用缓存中。

参数：

- k: 字符串，缓冲数据的名称。

- v: 任意对象，缓冲数据。


返回：
 
  同v,即应用的缓冲数据


#### `Cache.get()` ####

定义：

    function get(k);

说明：从应用的缓存中取回数据

参数：

 - k: 字符串，缓冲数据的名称。


返回：
 
   应用的对应k名称的缓冲数据，没有的话返回null



#### `Cache.del()` ####

定义：

    function del(k);

说明：删除应用缓存中的对应k的数据

参数：

 - k: 字符串，缓冲数据的名称。


返回：
 
   undefined


#### `Cache.clear()` ####

定义：

    function clear();

说明：删除该应用的私有缓存

参数：

 无


返回：
 
   undefined

   
#### `Cache.global.put()`{#Cache_global_put} ####

定义：

    function put(k,v);

说明：缓存rdk所有应用共享的数据

参数：

 - k: 字符串，缓冲数据的名称。

 - v: 任意对象，缓冲数据。



返回：
 
   同v,即缓冲数据

   
###rdk提供了一组可以操作基于rdk的所有应用共享内存操作###

#### `Cache.global.get()`{#Cache_global_get}####

定义：

    function get(k);

说明：返回rdk所有应用共享的缓存数据

参数：

 - k: 字符串，缓冲数据的名称。


返回：
 
   对应k名称的共享缓冲数据，没有的话返回null



#### `Cache.global.del()`{#Cache_global_del}####

定义：

    function del(k);

说明：删除rdk所有应用共享的名为k的缓存数据

参数：

 - k: 字符串，缓冲数据的名称。


返回：
 
   undefined


###rdk提供了一组带生命时长的缓存操作###

#### `Cache.aging.put()` ####

定义：

    function put(k, v, ttl, callback);

说明：缓存k,v映射数据于老化内存中，同时设置该数据的生命时长

参数：

 - k: 字符串，缓冲数据的名称。

 - v: 任意对象，缓冲数据。
 
 - ttl: 可选，数据生命时长，单位秒，默认为24小时。

 - callback:可选，回调函数，资源老化时rdk会自动调用它，用户可在清除老化对象时释放与该对象相关的资源，用户甚至可以利用该特性实现定时器回调功能。

示例：实现一个定时器，30秒后调用mycallback函数。

		     Cache.aging.put("timer","A",30,mycallback)

		     var mycallback = function () {
		        log("callback function!")
		     }


返回：
 
   同v,即缓冲数据


#### `Cache.aging.get()`####

定义：

    function get(k);

说明：返回老化内存中key对应的值，**注意，每次get会刷新时间戳，从而延长该记录的存活时间。**

参数：

 - k: 字符串，缓冲数据的名称。


返回：
 
   对应k名称的共享缓冲数据，没有的话返回null



#### `Cache.aging.del()`####

定义：

    function del(k);

说明：删除老化内存中key对应的记录

参数：

 - k: 字符串，缓冲数据的名称。


返回：
 
   undefined

### `Request` ###

#### `Request.completeWithError()` ####

定义：

    function completeWithError(status, detail);

说明：用于应用返回自定义错误码。这个方法一旦被调用，本次请求会马上终止。

参数：

 - status: 数字，http状态码，例如404 500等。默认为500
 - detail: 字符串，错误的详细说明。


返回：
 
   undefined

#### `Request.getContextHeader()` ####

定义：

	function getContextHeader();

参数：

无

返回：对应的当前请求对应http请求头对应的js对象。



### `rdk自动加载应用初始化脚本`{#init} ###

rdk_server在服务启动时会自动加载应用的初始化脚本。
应用需要在其**server**目录下放置名为**init.js**的文件即可，
比如应用可以将其缓存数据的操作放置在这个文件中，这样可以避免应用因为缓存数据较大，执行比较耗时而导致rest请求超时。

完整示例：
应用example需要使用缓存功能，那么就可以在example/server目录下的init.js中编写以下代码：

			(function () {
			    function _init_() {
					try{
						Cache.put("ne_data",Mapper.fromSql("select neid,name from dim_ne",'neid','name',4000))
					}catch(error){
						log("cache ne_data error"+error)
					}
			    }
			    return {
			        init: _init_
			    }
			})();

这样在example服务my_service.js中可以这样写来使用该缓存：

           Cache.get("ne_data")(11) //Cache.get("ne_data")返回的是一个转换函数闭包，对其进行调用即可获取neid=11对应的name值

**注意，若init.js文件发生修改，请一定要重启rdk_server才会生效。**
### `JVM.loadClass()` ###

定义：

	function loadClass(jarPath, className);

参数：

- jarPath 一个字符串。jar包所在路径，如果是一个jar文件，则只加载该文件，如果是一个目录，则加载该目录下所有的扩展名为jar的文件。可使用[路径宏](relative_path_rule.md)简化路径。
- className 一个字符串。class的全类名。

返回：Java的Class。

说明：应用需要使用到第三方jar包中的类时，可以使用这个函数把类反射出来到js中直接调用： 

    var myClass = loadClass("$base/lib/optimize.jar", "com.zte.sql.optimizer.SqlOptimizer");
	var myInst = myClass.newInstance();
	var result = myInst.myMethod(...);

上述代码会把 app/example/server/lib/optimize.jar（以example应用为例）加载到虚拟机中，并实例出 `com.zte.sql.optimizer.SqlOptimizer` 这个类的一个实例。

注意：RDK虚拟机的JRE是1.8的，所以在JS中实例化并运行的Java代码，都是在JRE1.8下跑的;
      多次加载同一个jar包虽然不会影响功能，但对性能会有一定的影响，因此当参数jarPath为包目录时，应避免在同一个服务中多次使用，以免重复加载造成性能问题。

#### JS与Java互传参数的建议 ####

JS调用Java方法，原则是只传递基本类型，包括数字（long），字符串（String），不要传递复杂对象，JS也可以传递任意结构到Java，在Java中被映射成ScriptObjectMirror类型，请自行百度这个类的用法。

Java返回数据给JS，原则也是尽量只返回简单类型。当然也可以返回Java类型的对象给JS，在JS中可以调用这个类的所有public方法，比如下面的JS代码：

	var myInst = myClass.newInstance();
	//假设getHashMap返回一个 java.util.HashMap 对象
	var map = myInst.getHashMap();
	map.get("myKey"); //得到HashMap中myKey的值。
	map.size(); //得到HashMap的个数

我们都知道，JS是无类型语言，而Java是强类型语言，所以JS调用Java方法，传递的参数类型要非常注意，否则很容易在Java中找不到匹配的签名方法而导致调用失败。

例如在Java中定义了下面的方法

	public void myMethod(boolean flag) {
		//...
	}

使用下面的JS代码，尝试去调用 `myMethod()` 方法：

	var myInst = myClass.newInstance();
	//假设myMethod方法要求传递一个布尔型参数
	//这行代码报错
	var map = myInst.myMethod(true);
	
报错的原因是JS的true关键字传递到java中，变成一个long型1，因此虚拟机找不到匹配的签名方法。

这块的建议是：需要JS调用的Java方法，参数尽量定义成Object的，在Java代码去检查参数类型，以确保最大的兼容性。

### 国际化 ###
#### `i18n()`
定义：

	function i18n(key, param1, param2, ...);

参数：

- key 一个字符串或一个字符串数组。必选。国际化标签。
- paramN 一个字符串。可选。动态国际化标签的参数。

返回：对应的国际化文本或国际化文本数组。

说明：

- 后端的国际化配置文件必须放在应用目录下的 `server/i18n.js` 文件
- 此api的别名 I18n.format

示例：

	//静态国际化标签
	var label = i18n('hello'); // 你好 RDK
  
    //数组国际化
    var label = i18n(['hello','world']); // ['你好','世界'] 

	//动态国际化标签
	var label = i18n('select', 10); // 选中了 10 个对象

#### `I18n.locale()`
定义：

	function locale();

参数：无

返回：当前系统的语言环境

示例：

	//静态国际化标签
	debug(I18n.locale()); // zh_CN



### `Host对象` ###

该对象提供了一组可以获取主机相关信息的方法。

#### `Host.getName()` ####
定义：

	function getName();

参数：

无

返回：获取服务主机名。

#### `Host.getIp()` ####
定义：

	function getIp();

参数：

无

返回：数组，获取服务主机的所有ipv4。

说明：支持多网卡情况ip获取。


### 定时器 ###

RDK暂时没有定时器api可直接使用，但是可以通过定时老化缓存功能来模拟定时器。示例代码如下

	Cache.aging.put('timed-job-name-123', '', 20, sendHeartBeat);

注意，这个方式模拟的定时器，会有30s左右的误差。比如上述代码，两次调用间隔时间落在这个区间 [20, 50]。

如果你需要更精确的定时器，可以自行使用多线程模拟，或者向我们提需求。

## 日期相关 ##

[单击这里](service_date_api.md)


## COMMON包相关 ##
[单击这里](common.md)



### `Async对象` ###

该对象提供了一些异步任务执行，状态查询和结果读取方法。

#### `Async.run()`
定义：

	function run(callback, context);

说明：用于执行异步的callback任务。

参数：

- callback 异步调用的函数。
- context 异步函数执行的上下文对象。

返回：异步任务的remoteToken，以供后续读取异步任务结果，查询异步任务状态使用。

###### `callback详解`
定义：

	function callback(key);

参数：

- key 自动生成，用于标记本次异步任务，只需要在定义callback的时候声明即可，无需在Async.run调用时传入。

注意：RDK不处理callback的返回结果，应用可以调用Async.append接口将异步结果缓存到aging cache中，aging cache的默认有效时间为24小时，callback执行的超时时间为4小时，超时过后RDK会将相应的任务杀死，并标记状态为killed。

#### `Async.read()`
定义：

	function read(remoteToken, deleteAfterRead);

说明：用于读取异步任务的结果。

参数：

- remoteToken 异步任务的token，由Async.run 返回。
- deleteAfterRead 删除异步任务在缓存中的结果，默认为true。

返回：异步任务的中间结果，为json格式的数组。

#### `Async.checkStatus()`
定义：

	function checkStatus(remoteToken, deleteAfterCheckStatus);

说明：用于读取异步任务的状态。

参数：

- remoteToken 异步任务的token，由Async.run 返回。
- deleteAfterRead 删除异步任务在缓存中的状态，默认为false。

返回：异步任务的状态。

- Running 异步任务尚在执行。
- Finished 异步任务执行完成。
- Killed 异步任务因为执行时间过长而被终止，超时时间为4小时。


#### `Async.append()`
定义：

	function append(key, value);

说明：在callback中调用，用于存储异步的中间结果到rdk的aging cache里，key为异步任务的标记，value为一个数组。

参数：

- key 异步任务的标记，为callback中的第一个参数。
- value 需要缓存的异步结果。

返回：缓存的异步结果。


#### `Async.clearOutput()`
定义：

	function clearOutput(key);

说明：在callback中调用，用于清空之前所存储的异步中间结果，即将aging cache里对应的缓存清空。

参数：

- key 异步任务的token，由Async.run返回。

####异步任务执行示例
第一步：定义callback。

	function callback(key){
		for(x in this.arr){
		 Async.append(key, x) //异步接口，用于缓存异步中间结果
		}
		return 
	 }
	 
第二步：执行callback。
        var context={"arr":[1,2,3]}
	var token =  Async.run(callback, context)

	//获取异步的结果，并尝试清空缓存，期望为 {"0":"1","1":"2","2":"3"}
	var result = Async.read(token, true)

	//获取异步的状态，并尝试清空状态，期望为Finished
	var status = Async.checkStatus(token,true)

	//获取异步的结果，期望为()
	var result = Async.read(token, true)

	//获取异步的状态，期望为()
	var status = Async.checkStatus(token,true)