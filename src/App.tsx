import { useCallback, useEffect, useState } from "react";
import "./App.css";
import EChartsComponent from "./echarts";
import Form from "./form";
import { FieldType, bitable } from "@lark-base-open/js-sdk";
import { Spin, message } from "antd";

// import './i18n'; // 取消注释以启用国际化

export const FIELDS: any = {
	[FieldType.Text]: {
		getCellValue: (record: any, field: any) => record.fields[getFieldId(field)]?.[0].text || "空值",
		allowX: true,
		allowY: true,
	},
	// [FieldType.SingleSelect]: {
	// 	allowX: true,
	// },
	[FieldType.DateTime]: {
		getCellValue: (record: any, field: any) => {
			let timeStamp = record.fields[getFieldId(field)];
			if (!timeStamp) {
				return "空值";
			}
			let date = new Date();
			let day = date.getDate();
			let month = date.getMonth() + 1; // 月份是从 0 开始的
			let year = date.getFullYear();
			return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
		},
		allowX: true,
	},
	[FieldType.Number]: {
		getCellValue: (record: any, field: any) => record.fields[getFieldId(field)] || "空值",
		allowX: true,
		allowY: true,
	},
	[FieldType.User]: {
		getCellValue: (record: any, field: any) => record.fields[getFieldId(field)]?.map((user: any) => user?.name).join("、") || "空值",
		// getValue: (users: any[]) => {
		// 	users.map(user => user.name).join("、");
		// },
		allowX: true,
	},

	getAllowedFields(type: "X" | "Y") {
		let fields: number[] = [];
		Object.keys(this).forEach(field => {
			if (this[field][type === "X" ? "allowX" : "allowY"]) {
				fields.push(Number(field));
			}
		});
		return fields;
	},
};

// 用官方的 table.getCellValue 方法获取单列数据
function getFieldValues(records: any, table: any, field: any): Promise<any[]> {
	return Promise.all(records.map((record: any) => table.getCellValue(field.context[1], record.recordId)));
}

function getFieldId(field: any): string {
	return field.context[1];
}

function getFieldValuesByRecords(records: any[], field: any): Promise<any[]> {
	return Promise.all(records.map(async record => FIELDS[await field.getType()].getCellValue(record, field)));
}

export default function App() {
	let [option, setOption] = useState({});
	let [loading, setLoading] = useState(false);
	const formSubmit = useCallback(async (formData: any) => {
		setLoading(true);
		try {
			const [key, { table, xAxisField, dataFields, chartType, theme }] = formData;
			let records = (await table.getRecords({ pageSize: 5000 })).records;
			// console.log("getRecords", records);

			let xAxisRecords = await getFieldValuesByRecords(records, xAxisField);
			console.log(xAxisRecords);

			let yAxisRecords = await getFieldValuesByRecords(records, dataFields);
			console.log(yAxisRecords);

			setOption({
				// title: {
				// 	text: "ECharts 入门示例",
				// },
				tooltip: {},
				legend: {
					data: [await xAxisField.getName()],
				},
				xAxis: {
					data: xAxisRecords,
				},
				yAxis: {},
				series: [
					{
						name: await xAxisField.getName(),
						type: chartType,
						data: yAxisRecords,
					},
				],
			});
		} finally {
			// console.error(error.message);
			setLoading(false);
		}
	}, []);

	return (
		<>
			<Spin spinning={loading}>
				<Form onSubmit={formSubmit} tableId={""} bitable={bitable}></Form>
				<EChartsComponent option={option}></EChartsComponent>
			</Spin>
		</>
	);
}
