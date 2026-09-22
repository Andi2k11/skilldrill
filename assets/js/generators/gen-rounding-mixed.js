window.roundingGenerators = window.roundingGenerators || {};
function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function choice(a){return a[randInt(0,a.length-1)];}
function fmtInt(n){return new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);}
function fmtScaled(n,d){var s=String(n).padStart(d+1,'0');return s.slice(0,-d)+','+s.slice(-d);}

window.roundingGenerators['rounding-mixed']=(function(){
 var iv={ones:1,tens:10,hundreds:100,thousands:1000},dd={tenths:1,hundredths:2,thousandths:3},names={ones:'ental',tens:'tiotal',hundreds:'hundratal',thousands:'tusental',tenths:'tiondel',hundredths:'hundradel',thousandths:'tusendel'};
 function makeInt(s){var n=randInt(s.min,s.max),p=choice(s.roundingPlaces),a=Math.round(n/iv[p])*iv[p],d=fmtInt(n);return {numberType:'integer',number:n,numberDisplay:d,place:p,placeName:names[p],text:'Avrunda '+d+' till närmaste '+names[p]+'.',answer:a,answerDisplay:fmtInt(a)};}
 function makeDec(s){var places=s.decimalPlaces,scale=Math.pow(10,places),n=randInt(Math.ceil(s.min*scale),Math.ceil(s.maxExclusive*scale)-1),p=choice(s.roundingPlaces),target=dd[p],rounded=Math.round(n/Math.pow(10,places-target)),a=rounded/Math.pow(10,target),d=fmtScaled(n,places);return {numberType:'decimal',number:n/scale,numberDisplay:d,place:p,placeName:names[p],text:'Avrunda '+d+' till närmaste '+names[p]+'.',answer:a,answerDisplay:a.toFixed(target).replace('.',',')};}
 return {generate:function(p){
		var q=[];
		var count=p.questionCount||15;
		for(var i=0;i<count;i++){
			if(i%2===0){ q.push(makeInt(p.integer)); }
			else { q.push(makeDec(p.decimal)); }
		}
		return q;
	}};
})();
