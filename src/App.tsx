import { useCallback, useState } from "react";
import "./App.css";
import EChartsComponent from "./echarts";
import Form from "./form";
import { bitable } from "@lark-base-open/js-sdk";
import { Result, Spin } from "antd";
import { getFieldValuesByRecords } from "./fields-meta";
import Navigation from "./navigation";
import { SmileOutlined } from "@ant-design/icons";

// import './i18n'; // 取消注释以启用国际化

export default function App() {
	let [option, setOption] = useState({});
	let [loading, setLoading] = useState(false);
	let [navi, setNavi] = useState("view");
	const formSubmit = useCallback(async (formData: any) => {
		setLoading(true);
		try {
			const [key, { table, view, xAxisField, dataFields, chartType }] = formData;
			let records = await Promise.all((await view.getVisibleRecordIdList()).map((recordId: string) => table.getRecordById(recordId)));
			// console.log("getRecords", records);
			// let xAxisName = await xAxisField.getName();
			let xAxisRecords = await getFieldValuesByRecords(records, xAxisField);
			// console.log(xAxisRecords);
			// console.log(dataFields);
			let yAxisRecords = await Promise.all(dataFields.map((dataField: any) => getFieldValuesByRecords(records, dataField)));
			let yAxisNames = await Promise.all(dataFields.map((dataField: any) => dataField.getName()));

			setOption({
				toolbox: {
					show: true,
					feature: {
						magicType: {
							type: ["line", "bar"],
						},
						restore: {},
						saveAsImage: { pixelRatio: 2, name: yAxisNames.join("-") },
					},
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
					},
				},
				legend: {},
				xAxis: {
					data: xAxisRecords,
					axisPointer: {
						show: true,
					},
				},
				yAxis: yAxisRecords.map((record, i) => {
					return { name: yAxisNames[i], axisLine: { show: true }, offset: Math.max(40 * (i - 1), 0), alignTicks: true };
				}),
				series: yAxisRecords.map((record, i) => {
					return { name: yAxisNames[i], type: chartType, data: record, yAxisIndex: i };
				}),
			});
		} finally {
			// console.error(error.message);
			setLoading(false);
		}
	}, []);

	// const onNaviChange = useCallback(async (navi: string) => {

	// }, [])

	return (
		<>
			<Navigation onNaviChange={setNavi}></Navigation>
			{navi === "view" ? (
				<>
					<Spin spinning={loading}>
						<Form onSubmit={formSubmit} bitable={bitable}></Form>
						<EChartsComponent option={option}></EChartsComponent>
					</Spin>
				</>
			) : (
				<Result icon={<SmileOutlined />} title="开发中，敬请期待" />
			)}
		</>
	);
}
