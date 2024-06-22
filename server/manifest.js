const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["assets/bg/bg.jpg","assets/bg/filter.svg","assets/HandBG.svg","assets/Pictures/MitigationCards/MC01.jpg","assets/Pictures/MitigationCards/MC02.jpg","assets/Pictures/MitigationCards/MC03.jpg","assets/Pictures/MitigationCards/MC04.jpg","assets/Pictures/MitigationCards/MC05.jpg","assets/Pictures/MitigationCards/MC06.jpg","assets/Pictures/MitigationCards/MC07.jpg","assets/Pictures/MitigationCards/MC08.jpg","assets/Pictures/MitigationCards/MC09.jpg","assets/Pictures/MitigationCards/ME01.jpg","assets/Pictures/MitigationCards/ME02.jpg","assets/Pictures/MitigationCards/ME03.jpg","assets/Pictures/MitigationCards/ME04.jpg","assets/Pictures/MitigationCards/ME05.jpg","assets/Pictures/MitigationCards/ME06.jpg","assets/Pictures/MitigationCards/ME07.jpg","assets/Pictures/MitigationCards/ME08.jpg","assets/Pictures/MitigationCards/ME09.jpg","assets/Pictures/MitigationCards/ME10.jpg","assets/Pictures/MitigationCards/ME11.jpg","assets/Pictures/MitigationCards/ME12.jpg","assets/Pictures/MitigationCards/ME13.jpg","assets/Pictures/MitigationCards/MM01.jpg","assets/Pictures/MitigationCards/MM02.jpg","assets/Pictures/MitigationCards/MM03.jpg","assets/Pictures/MitigationCards/MM04.jpg","assets/Pictures/MitigationCards/MM05.jpg","assets/Pictures/MitigationCards/MM06.jpg","assets/Pictures/MitigationCards/MM07.jpg","assets/Pictures/MitigationCards/MM08.jpg","assets/Pictures/MitigationCards/MM09.jpg","assets/Pictures/MitigationCards/MM10.jpg","assets/Pictures/MitigationCards/MM11.jpg","assets/Pictures/MitigationCards/MM12.jpg","assets/Pictures/MitigationCards/MM13.jpg","assets/Pictures/MitigationCards/MM14.jpg","assets/Pictures/MitigationCards/MM15.jpg","assets/Pictures/MitigationCards/MM16.jpg","assets/Pictures/MitigationCards/MM17.jpg","assets/Pictures/MitigationCards/MM18.jpg","assets/Pictures/MitigationCards/MM19.jpg","assets/Pictures/MitigationCards/MM20.jpg","assets/Pictures/MitigationCards/MM21.jpg","assets/Pictures/MitigationCards/MM22.jpg","assets/Pictures/MitigationCards/MM23.jpg","assets/Pictures/MitigationCards/MM24.jpg","assets/Pictures/MitigationCards/MT01.jpg","assets/Pictures/MitigationCards/MT02.jpg","assets/Pictures/MitigationCards/MT03.jpg","assets/Pictures/MitigationCards/MT04.jpg","assets/Pictures/MitigationCards/MT05.jpg","assets/Pictures/MitigationCards/MT06.jpg","assets/Pictures/MitigationCards/MT07.jpg","assets/Pictures/MitigationCards/MT08.jpg","assets/Pictures/MitigationCards/MT09.jpg","assets/Pictures/MitigationCards/MT10.jpg","assets/Pictures/MitigationCards/MT11.jpg","assets/Pictures/MitigationCards/MT12.jpg","assets/Pictures/MitigationCards/MT13.jpg","assets/Pictures/MitigationCards/MT14.jpg","assets/Pictures/MitigationCards/MT15.jpg","assets/Pictures/MitigationCards/MT16.jpg","assets/Pictures/MitigationCards/MT17.jpg","assets/Pictures/MitigationCards/MT18.jpg","assets/Pictures/RiskCards/C01.jpg","assets/Pictures/RiskCards/C02.jpg","assets/Pictures/RiskCards/C03.jpg","assets/Pictures/RiskCards/C04.jpg","assets/Pictures/RiskCards/C05.jpg","assets/Pictures/RiskCards/C06.jpg","assets/Pictures/RiskCards/C07.jpg","assets/Pictures/RiskCards/C08.jpg","assets/Pictures/RiskCards/C09.jpg","assets/Pictures/RiskCards/C10.jpg","assets/Pictures/RiskCards/C11.jpg","assets/Pictures/RiskCards/C12.jpg","assets/Pictures/RiskCards/C13.jpg","assets/Pictures/RiskCards/E01.jpg","assets/Pictures/RiskCards/E02.jpg","assets/Pictures/RiskCards/E03.jpg","assets/Pictures/RiskCards/E04.jpg","assets/Pictures/RiskCards/E05.jpg","assets/Pictures/RiskCards/E06.jpg","assets/Pictures/RiskCards/E07.jpg","assets/Pictures/RiskCards/E08.jpg","assets/Pictures/RiskCards/E09.jpg","assets/Pictures/RiskCards/M01.jpg","assets/Pictures/RiskCards/M02.jpg","assets/Pictures/RiskCards/M03.jpg","assets/Pictures/RiskCards/M04.jpg","assets/Pictures/RiskCards/M05.jpg","assets/Pictures/RiskCards/M06.jpg","assets/Pictures/RiskCards/M07.jpg","assets/Pictures/RiskCards/M08.jpg","assets/Pictures/RiskCards/M09.jpg","assets/Pictures/RiskCards/M10.jpg","assets/Pictures/RiskCards/M11.jpg","assets/Pictures/RiskCards/M12.jpg","assets/Pictures/RiskCards/M13.jpg","assets/Pictures/RiskCards/M14.jpg","assets/Pictures/RiskCards/M15.jpg","assets/Pictures/RiskCards/M16.jpg","assets/Pictures/RiskCards/M17.jpg","assets/Pictures/RiskCards/R02.jpg","assets/Pictures/RiskCards/R03.jpg","assets/Pictures/RiskCards/R04.jpg","assets/Pictures/RiskCards/R05.jpg","assets/Pictures/RiskCards/R06.jpg","assets/Pictures/RiskCards/R07.jpg","assets/Pictures/RiskCards/R08.jpg","assets/Pictures/RiskCards/R09.jpg","assets/Pictures/RiskCards/T01.jpg","assets/Pictures/RiskCards/T02.jpg","assets/Pictures/RiskCards/T03.jpg","assets/Pictures/RiskCards/T04.jpg","assets/Pictures/RiskCards/T05.jpg","assets/Pictures/RiskCards/T06.jpg","assets/Pictures/RiskCards/T07.jpg","assets/Pictures/RiskCards/T08.jpg","assets/Pictures/RiskCards/T09.jpg","assets/Pictures/RiskCards/T10.jpg","assets/Pictures/RiskCards/T11.jpg","assets/Pictures/RiskCards/T12.jpg","assets/Pictures/RiskCards/T13.jpg","assets/Pictures/RiskCards/T14.jpg","assets/Pictures/RiskCards/T15.jpg","assets/Pictures/RiskCards/T16.jpg","assets/Pictures/RiskCards/X01.jpg","assets/Pictures/RiskCards/X02.jpg","favicon.png"]),
	mimeTypes: {".jpg":"image/jpeg",".svg":"image/svg+xml",".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.CCtAHilb.js","app":"_app/immutable/entry/app.tvAEFl5T.js","imports":["_app/immutable/entry/start.CCtAHilb.js","_app/immutable/chunks/entry.lDvvRzGQ.js","_app/immutable/chunks/runtime.BrGAlQLE.js","_app/immutable/entry/app.tvAEFl5T.js","_app/immutable/chunks/proxy.C1cAMjUF.js","_app/immutable/chunks/runtime.BrGAlQLE.js","_app/immutable/chunks/render.D5wEQ807.js","_app/immutable/chunks/disclose-version.BvK3jvqC.js","_app/immutable/chunks/index-client.CIlSrE4b.js","_app/immutable/chunks/props.D6mOH0iB.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./chunks/0-D0qEsQI6.js')),
			__memo(() => import('./chunks/1-D2mTjK0m.js')),
			__memo(() => import('./chunks/2-Ci7hEYER.js')),
			__memo(() => import('./chunks/3-BHGeqVUr.js')),
			__memo(() => import('./chunks/4-BURPke73.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/game",
				pattern: /^\/game\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
