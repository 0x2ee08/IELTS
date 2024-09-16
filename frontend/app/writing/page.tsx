'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WritingPage: React.FC = () => {
    const router = useRouter();
    
    const handleEnterTask = (task: string) => {
        router.push(`/writing/${task}`);
    };

    return (
        <div className='flex flex-col min-h-screen'>
            <Header />
            
            <div style={{paddingLeft:'5%',paddingRight:'5%',marginTop:"25px"}}>
                <section className='bg-white-100 p-4 text-center rounded-lg' style={{background:"rgba(245,250,250,255)",paddingLeft:'5%',paddingRight:'5%',marginTop:"25px"}}>
                    <h1 className='font-extrabold' style={{fontSize:"33px",padding:"30px"}}>
                        One of the most accurate IELTS Essay checker online
                    </h1>
                    <div className='flex justify-around'>
                        <button 
                            className="font-extrabold px-8 py-3 bg-[#0077B6] text-white rounded-lg hover:shadow-xl hover:bg-[#005f89] transition-all duration-300 ease-in-out transform hover:scale-95"
                            onClick={() => handleEnterTask('task1')}
                            >
                            Task 1
                        </button>
                        <button 
                            className="font-extrabold px-8 py-3 bg-[#0077B6] text-white rounded-lg hover:shadow-xl hover:bg-[#005f89] transition-all duration-300 ease-in-out transform hover:scale-95"
                            onClick={() => handleEnterTask('task2')}
                            >
                            Task 2
                        </button>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default WritingPage;
