const defaultState = {
	data: [],
	status: 'busy',
	map: null,
	size:30
}

const Media = (state=defaultState,action)=>{
	switch(action.type) {
		case 'SET_MEDIA':
			var m = new Map();
			action.data.forEach(item=>{
				m.set(item.hash,item);
			});
			return Object.assign({},state,{data:action.data,status:'ready',map:m});
		case 'SET_THUMB':
			var item = state.map.get(action.data.hash);
			item.status = action.status;
			item.path = action.data.path;
			return Object.assign({},state);
		case 'SET_MEDIA_IMAGE':
			let image = Object.assign({},action.item,{status:'ready',path:action.item.path,open:true});
			return Object.assign({},state,{currentMediaImage:image});
		case 'SET_MEDIA_SIZE':
			var s;
			if (action.reset) {
				s = 30;
			}else {
				s = state.size+30;
			}
			console.log(s);
			return Object.assign({},state,{size:s});
		case 'ADAPTER':
			return Object.assign({},state,action.store.media)
		default:
			return state;
	}
}

export default Media;